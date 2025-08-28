'use client';

import { useQuery } from '@tanstack/react-query';
import { WeeklyPM25Forecast, ForecastSkeleton } from '@/components';
import { fetchWeeklyPM25Forecast } from '@/features/air-quality/api';
import { WeeklyPM25ForecastItem } from '@/features/air-quality/types';

type Props = {
  initialData?: WeeklyPM25ForecastItem;
};

function wrapWeekly(item: WeeklyPM25ForecastItem | undefined) {
  const items = item ? [item] : [];
  return {
    response: {
      header: { resultCode: '00', resultMsg: 'OK' },
      body: { totalCount: items.length, pageNo: 1, numOfRows: items.length, items },
    },
  } as const;
}

export default function ClientWeeklyPM25Forecast({ initialData }: Props) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['airQuality', 'weeklyPM25Forecast'],
    queryFn: fetchWeeklyPM25Forecast,
    staleTime: 3 * 60 * 60 * 1000, // 3시간
    initialData: initialData ? wrapWeekly(initialData) : undefined,
  });

  const item = data?.response?.body?.items?.[0];

  if (isLoading) {
    return <ForecastSkeleton />;
  }

  if (!item) {
    return (
      <div className='text-center py-8 text-muted-foreground'>
        <p>예보 데이터가 없습니다.</p>
        {isError && <p className='text-sm mt-2'>데이터를 불러오는 중 오류가 발생했습니다.</p>}
      </div>
    );
  }

  return <WeeklyPM25Forecast data={item} />;
}
