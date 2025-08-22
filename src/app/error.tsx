'use client';

import { useEffect } from 'react';

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function Error({ error, reset }: Props) {
  useEffect(() => {
    console.error('에러 발생:', error);
  }, [error]);

  return (
    <div className='container mx-auto p-6'>
      <div className='bg-destructive/10 border border-destructive text-destructive p-6 rounded-md'>
        <h2 className='text-xl font-bold mb-4'>문제가 발생했습니다</h2>
        <p className='mb-4'>데이터를 불러오는 중에 오류가 발생했습니다.</p>
        <button
          onClick={reset}
          className='px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors'
        >
          다시 시도
        </button>
      </div>
    </div>
  );
}
