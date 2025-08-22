'use client';

import React from 'react';
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';

type FallbackProps = {
  error: Error;
  resetErrorBoundary: () => void;
};

const DefaultFallback = ({ error, resetErrorBoundary }: FallbackProps) => {
  return (
    <div className='p-4 border border-red-300 rounded-md bg-red-50 dark:bg-red-900/20 dark:border-red-800'>
      <div className='flex items-center gap-2 mb-2'>
        <svg
          xmlns='http://www.w3.org/2000/svg'
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
          className='w-5 h-5 text-red-500 dark:text-red-400'>
          <circle
            cx='12'
            cy='12'
            r='10'
          />
          <line
            x1='12'
            y1='8'
            x2='12'
            y2='12'
          />
          <line
            x1='12'
            y1='16'
            x2='12.01'
            y2='16'
          />
        </svg>
        <h3 className='text-lg font-semibold text-red-800 dark:text-red-300'>오류가 발생했습니다</h3>
      </div>
      <p className='text-sm text-red-700 dark:text-red-400 mb-3'>
        {error.message || '알 수 없는 오류가 발생했습니다.'}
      </p>
      <button
        onClick={resetErrorBoundary}
        className='px-3 py-1 text-sm rounded-md bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-800/30 dark:text-red-300 dark:hover:bg-red-800/50 transition-colors'>
        다시 시도
      </button>
    </div>
  );
};

type ErrorBoundaryProps = {
  children: React.ReactNode;
  fallback?: React.ComponentType<FallbackProps>;
  onReset?: () => void;
};

export function ErrorBoundary({ children, fallback, onReset }: ErrorBoundaryProps) {
  const Fallback = fallback || DefaultFallback;

  return (
    <ReactErrorBoundary
      FallbackComponent={Fallback}
      onReset={onReset}>
      {children}
    </ReactErrorBoundary>
  );
}
