import { cookies } from 'next/headers';

// Theme 타입 다시 정의 (순환 참조 방지)
export type Theme = 'light' | 'dark' | 'system';

// 서버에서 테마 값 가져오기
export async function getTheme(): Promise<Theme> {
  const cookieStore = await cookies();
  const themeCookie = cookieStore.get('theme');
  return (themeCookie?.value as Theme) || 'system';
}

// 서버에서 해결된 테마 값 가져오기
export async function getResolvedTheme(): Promise<'light' | 'dark'> {
  const theme = await getTheme();

  // system 테마는 서버에서는 기본적으로 light로 처리
  // 클라이언트에서 시스템 설정에 따라 다시 조정됨
  return theme === 'system' ? 'light' : theme;
}
