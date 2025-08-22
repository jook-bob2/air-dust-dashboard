'use server';

import { cookies } from 'next/headers';
import { Theme } from '@/lib/theme';

// 서버에서 테마 설정 처리 - 쿠키에 저장
export async function setTheme(theme: Theme) {
  const cookieStore = await cookies();
  cookieStore.set('theme', theme, {
    path: '/',
    maxAge: 31536000, // 1년
    sameSite: 'lax',
  });

  // 리다이렉트 없이 클라이언트에서 즉시 테마 적용
  return { success: true };
}
