'use client';

import { ReactQueryDevtools } from '@/providers/react-query';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { Theme } from '@/lib/theme';

type ProvidersProps = {
  children: React.ReactNode;
  initialTheme: Theme;
};

export function Providers({ children, initialTheme }: ProvidersProps) {
  return (
    <ThemeProvider initialTheme={initialTheme}>
      <ReactQueryDevtools>{children}</ReactQueryDevtools>
    </ThemeProvider>
  );
}
