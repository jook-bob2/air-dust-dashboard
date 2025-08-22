'use client';

import { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools as TanStackReactQueryDevtools } from '@tanstack/react-query-devtools';

type ReactQueryDevtoolsProps = {
  children: ReactNode;
};

// 클라이언트 컴포넌트에서만 사용할 수 있는 QueryClient 인스턴스 생성
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1분
      refetchOnWindowFocus: false,
    },
  },
});

export function ReactQueryDevtools({ children }: ReactQueryDevtoolsProps) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <TanStackReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
