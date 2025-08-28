import type { Metadata } from 'next';
import './globals.css';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { getTheme } from '@/lib/theme';
import { darkModeScript } from '@/lib/utils/darkMode';
import { notoSansKR, notoSansMono } from '@/styles/fonts';

export const metadata: Metadata = {
  title: '미세먼지 알리미 - 전국 대기 품질 정보',
  description: '환경부 에어코리아 공공데이터 기반 실시간 미세먼지 정보 제공 서비스',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const initialTheme = await getTheme();

  return (
    <html
      lang='ko'
      suppressHydrationWarning
      className={initialTheme === 'dark' ? 'dark' : ''}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: darkModeScript }} />
      </head>
      <body className={`${notoSansKR.variable} ${notoSansMono.variable} antialiased`}>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider initialTheme={initialTheme}>
            {children}
            <ReactQueryDevtools initialIsOpen={false} />
          </ThemeProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}
