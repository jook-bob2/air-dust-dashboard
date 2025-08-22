'use client';

import { ErrorBoundary } from './ErrorBoundary';

type ErrorBoundaryWrapperProps = {
  children: React.ReactNode;
};

export function ErrorBoundaryWrapper({ children }: ErrorBoundaryWrapperProps) {
  return <ErrorBoundary>{children}</ErrorBoundary>;
}
