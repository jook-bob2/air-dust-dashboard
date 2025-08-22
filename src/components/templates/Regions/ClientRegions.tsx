'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { SidoSelector, AirQualityGrade, PollutantValue, AirQualityListSkeleton, KakaoAirQualityMap } from '@/components';
import { SIDO_LIST } from '@/features/air-quality/constants';
import type { SidoAirQualityItem } from '@/features/air-quality/types';
import { fetchAirQualityBySido, fetchAirQualityByStation } from '@/features/air-quality/api';

// 간단한 SVG 차트 (의존성 추가 없이 구현)
function MiniLineChart({ values }: { values: number[] }) {
  if (!values.length) {
    return <div className="text-sm text-muted-foreground">N/A</div>;
  }
  const width = 320;
  const height = 80;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const norm = (v: number) => (max === min ? height / 2 : height - ((v - min) / (max - min)) * height);
  const step = width / Math.max(values.length - 1, 1);
  const path = values.map((v, i) => `${i === 0 ? 'M' : 'L'} ${i * step},${norm(v)}`).join(' ');
  return (
    <svg width={width} height={height} role="img" aria-label="시간대별 변화 그래프" className="w-full max-w-sm">
      <path d={path} stroke="currentColor" strokeWidth="2" fill="none" className="text-primary" />
    </svg>
  );
}


// 즐겨찾기 로컬 저장소 키
const FAV_KEY = 'fav_regions_v1';

function useFavorites() {
  const [favs, setFavs] = useState<string[]>([]);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(FAV_KEY);
      if (raw) setFavs(JSON.parse(raw));
    } catch {}
  }, []);
  const toggle = useCallback((key: string) => {
    setFavs(prev => {
      const next = prev.includes(key) ? prev.filter(v => v !== key) : [...prev, key];
      localStorage.setItem(FAV_KEY, JSON.stringify(next));
      return next;
    });
  }, []);
  return { favs, toggle };
}

function ModeToggle({ mode, onChange }: { mode: 'list' | 'map'; onChange: (m: 'list' | 'map') => void }) {
  return (
    <div className="inline-flex rounded-md border overflow-hidden" role="tablist" aria-label="표시 방식 선택">
      <button
        role="tab"
        aria-selected={mode === 'list'}
        onClick={() => onChange('list')}
        className={`px-3 py-2 text-sm ${mode === 'list' ? 'bg-primary text-primary-foreground' : ''}`}
      >
        리스트
      </button>
      <button
        role="tab"
        aria-selected={mode === 'map'}
        onClick={() => onChange('map')}
        className={`px-3 py-2 text-sm ${mode === 'map' ? 'bg-primary text-primary-foreground' : ''}`}
      >
        지도
      </button>
    </div>
  );
}

export default function ClientRegions({ initialSido, initialSidoItems }: { initialSido?: string; initialSidoItems?: SidoAirQualityItem[] }) {
  const [sido, setSido] = useState(initialSido ?? SIDO_LIST[0]);
  const [items, setItems] = useState<SidoAirQualityItem[] | null>(initialSidoItems ?? null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'list' | 'map'>('list');
  const [sigungu, setSigungu] = useState<string | null>(null);
  const { favs, toggle } = useFavorites();
  // 위치 기반 날씨 → 요구사항 변경으로 미사용. 현 미세먼지 정보로 대체 표시.

  // 데이터 로드
  const load = useCallback(async (name: string) => {
    try {
      setLoading(true);
      const res = await fetchAirQualityBySido(name);
      const next = res?.response?.body?.items ?? [];
      setItems(next);
    } catch (e) {
      console.error('클라이언트에서 시도 데이터 로드 실패', e);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const didInitRef = useRef(false);

  useEffect(() => {
    // 최초 렌더 1회만 서버 선로딩 결과를 사용하고, 이후에는 항상 재요청
    if (!didInitRef.current && initialSidoItems && (sido === (initialSido ?? SIDO_LIST[0]))) {
      didInitRef.current = true;
      return; // 초기 한 번만 스킵
    }
    didInitRef.current = true;
    load(sido);
  }, [load, sido, initialSidoItems, initialSido]);

  // 시군구 유사 개념: 측정소 stationName을 이용해 그룹핑/검색
  const groups = useMemo(() => {
    const map = new Map<string, SidoAirQualityItem[]>();
    (items ?? []).forEach(it => {
      const key = it.stationName; // 간단화: 실제 시군구 데이터가 없으므로 측정소 기준
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(it);
    });
    return Array.from(map.entries())
      .sort((a, b) => a[0].localeCompare(b[0]));
  }, [items]);

  const filteredGroups = useMemo(() => {
    if (!sigungu) return groups;
    return groups.filter(([name]) => name.includes(sigungu));
  }, [groups, sigungu]);

  // 현재 미세먼지 요약(시도 기준)
  const summary = useMemo(() => {
    if (!items || items.length === 0) return null;
    const nums = (arr: (string | undefined)[]) => arr.map(v => Number(v)).filter(v => !Number.isNaN(v));
    const avg = (arr: number[]) => (arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : NaN);
    const toGradeNum = (g: string | undefined) => {
      const n = parseInt(g ?? '', 10);
      return Number.isNaN(n) ? 0 : n;
    };
    const pm25Vals = nums(items.map(i => i.pm25Value));
    const pm10Vals = nums(items.map(i => i.pm10Value));
    const pm25Avg = avg(pm25Vals);
    const pm10Avg = avg(pm10Vals);
    const pm25GradeNum = items.reduce((m, it) => Math.max(m, toGradeNum(it.pm25Grade)), 0);
    const pm10GradeNum = items.reduce((m, it) => Math.max(m, toGradeNum(it.pm10Grade)), 0);
    const pm25Grade = pm25GradeNum === 0 ? '-' : String(pm25GradeNum);
    const pm10Grade = pm10GradeNum === 0 ? '-' : String(pm10GradeNum);
    const dataTime = items[0]?.dataTime ?? '';
    return { pm25Avg, pm10Avg, pm25Grade, pm10Grade, dataTime };
  }, [items]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <SidoSelector selectedSido={sido} onSelect={setSido} />
          <input
            aria-label="시군구 또는 측정소 검색"
            className="px-3 py-2 border rounded-md bg-background"
            placeholder="시군구/측정소 검색"
            onChange={e => setSigungu(e.target.value || null)}
          />
          <ModeToggle mode={mode} onChange={setMode} />
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => toggle(`${sido}`)}
            className="px-3 py-2 border rounded-md"
            aria-pressed={favs.includes(sido)}
            aria-label="즐겨찾기 지역 토글"
          >
            {favs.includes(sido) ? '★ 즐겨찾기' : '☆ 즐겨찾기'}
          </button>
        </div>
      </div>

      {/* 현재 미세먼지 */}
      <div>
        <h2 className="text-lg font-semibold mb-2">현재 미세먼지</h2>
        {!summary ? (
          <div className="text-sm text-muted-foreground">정보 없음</div>
        ) : (
          <div className="rounded-lg border bg-card text-card-foreground p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <PollutantValue name="pm25" value={Number.isNaN(summary.pm25Avg) ? 'N/A' : String(summary.pm25Avg)} grade={summary.pm25Grade} />
              <PollutantValue name="pm10" value={Number.isNaN(summary.pm10Avg) ? 'N/A' : String(summary.pm10Avg)} grade={summary.pm10Grade} />
            </div>
            <div className="mt-2 text-xs text-muted-foreground">업데이트: {summary.dataTime || '정보 없음'}</div>
          </div>
        )}
      </div>

      {loading && !items && (
        <AirQualityListSkeleton />
      )}

      {/* 표시 모드 */}
      {mode === 'map' ? (
        <div className="rounded-lg border p-2">
          <KakaoAirQualityMap items={items ?? []} sidoName={sido} heightVh={70} />
        </div>
      ) : null}

      {/* 리스트 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredGroups.length === 0 && (
          <div className="text-muted-foreground">표시할 정보가 없습니다 (N/A)</div>
        )}
        {filteredGroups.map(([station, arr]) => {
          const first = arr[0];
          return (
            <div key={station} className="rounded-lg border bg-card text-card-foreground p-4 space-y-3" aria-label={`${station} 상태`}>
              <div className="flex items-center justify-between">
                <div className="font-semibold">{station}</div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">PM2.5</span>
                  <AirQualityGrade grade={first.pm25Grade || '-'} size="sm" showText={false} />
                  <span className="text-sm">{first.pm25Value || 'N/A'}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <PollutantValue name="pm25" value={first.pm25Value} grade={first.pm25Grade} />
                <PollutantValue name="pm10" value={first.pm10Value} grade={first.pm10Grade} />
              </div>
              <div className="text-xs text-muted-foreground">업데이트: {first.dataTime || '정보 없음'}</div>
              <StationHistory stationName={station} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StationHistory({ stationName }: { stationName: string }) {
  const [series, setSeries] = useState<{ pm25: number[]; times: string[] } | null>(null);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    let aborted = false;
    (async () => {
      try {
        setLoading(true);
        // 간단화: 최근 값 12개를 개별 호출로 수집 (실제 API는 다건 응답을 지원, 여기서는 최소 구현)
        const res = await fetchAirQualityByStation(stationName);
        const item = res?.response?.body?.items?.[0];
        const val = Number(item?.pm25Value ?? NaN);
        const time = item?.dataTime ?? '';
        if (!aborted) setSeries({ pm25: isNaN(val) ? [] : [val], times: time ? [time] : [] });
      } catch {
        if (!aborted) setSeries({ pm25: [], times: [] });
      } finally {
        if (!aborted) setLoading(false);
      }
    })();
    return () => {
      aborted = true;
    };
  }, [stationName]);

  return (
    <div className="mt-2">
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-medium">시간대별 PM2.5</span>
        {loading && <span className="text-xs text-muted-foreground">로딩중…</span>}
      </div>
      <MiniLineChart values={series?.pm25 ?? []} />
    </div>
  );
}
