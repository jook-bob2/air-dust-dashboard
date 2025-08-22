// 다크 모드 초기화 스크립트
export const darkModeScript = `
  (function() {
    try {
      // 쿠키에서 테마 값 읽기
      const cookies = document.cookie.split('; ');
      const themeCookie = cookies.find(cookie => cookie.startsWith('theme='));
      const theme = themeCookie ? themeCookie.split('=')[1] : 'system';

      // 시스템 테마 감지
      const systemDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;

      // 테마 적용
      if (theme === 'dark' || (theme === 'system' && systemDarkMode)) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch (e) {
      // 오류 발생 시 기본 라이트 테마 적용
      document.documentElement.classList.remove('dark');
    }
  })();
`;
