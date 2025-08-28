import ky from 'ky';
import { safeParseJson } from './safeParseJson';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE!;
const API_KEY = process.env.NEXT_PUBLIC_API_KEY!;

const isServer = typeof window === 'undefined';

export type RequestOptions = {
  searchParams?: Record<string, string | number | undefined>;
  /** Next.js ISR revalidate seconds for server fetch */
  revalidate?: number;
  /** Explicit cache mode for server fetch */
  cache?: RequestCache;
  init?: RequestInit;
};

function encodeServiceKeyOnce(key: string): string {
  // Heuristic:
  // - If key is raw (contains '+' or '=' and no '%'), encode it.
  // - If key is already properly encoded, keep it.
  // - If decoding/encoding roundtrip equals the original, treat as already encoded.
  try {
    const decoded = decodeURIComponent(key);
    const reEncoded = encodeURIComponent(decoded);
    if (key === reEncoded) {
      // already encoded
      return key;
    }
    if (key === decoded) {
      // raw key
      return reEncoded;
    }
    // Fallback: if it contains '%', assume encoded, else encode
    return key.includes('%') ? key : encodeURIComponent(key);
  } catch {
    // If decode fails, ensure we encode it once
    return encodeURIComponent(key);
  }
}

function buildUrl(path: string, params?: Record<string, string | number | undefined>) {
  const url = new URL(path, BASE_URL);
  const queryParts: string[] = [];

  if (API_KEY) {
    const encodedKey = encodeServiceKeyOnce(API_KEY);
    queryParts.push(`serviceKey=${encodedKey}`);
  }

  // 일부 API는 _returnType 혹은 returnType 둘 다 허용하므로 둘 다 추가해 강제 JSON 응답 유도
  queryParts.push('returnType=json', '_returnType=json');

  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v === undefined || v === null) continue;
      // 일반 파라미터는 안전하게 인코딩
      queryParts.push(`${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`);
    }
  }

  url.search = queryParts.join('&');
  return url.toString();
}

export async function getJson<T>(path: string, options: RequestOptions = {}): Promise<T | null> {
  const { searchParams, revalidate, cache, init } = options;

  if (isServer) {
    const url = buildUrl(path, searchParams);
    try {
      const res = await fetch(url, {
        // Enable Next.js caching on the server
        next: revalidate ? { revalidate } : undefined,
        cache: cache ?? 'force-cache',
        headers: {
          Accept: 'application/json',
        },
        ...init,
      });
      return await safeParseJson<T>(res);
    } catch (error) {
      console.warn('서버 fetch 실패:', error);
      return null;
    }
  }

  // Client: use ky with absolute URL (avoid prefixUrl duplication)
  try {
    const url = buildUrl(path, searchParams);
    const res = await ky.get(url, {
      retry: 1,
      timeout: 10000,
      headers: { Accept: 'application/json' },
      hooks: {
        beforeError: [
          error => {
            console.warn(`API 경고: ${error.request.url}`, error);
            return error;
          },
        ],
      },
    });
    return await safeParseJson<T>(res as unknown as Response);
  } catch (error) {
    console.warn('클라이언트 ky 실패:', error);
    return null;
  }
}
