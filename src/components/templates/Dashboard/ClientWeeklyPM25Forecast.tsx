'use client';

import { useQuery } from '@tanstack/react-query';
import { WeeklyPM25Forecast, ForecastSkeleton } from '@/components';
import { fetchWeeklyPM25Forecast } from '@/features/air-quality/api';
import { WeeklyPM25ForecastItem } from '@/features/air-quality/types';

type Props = {
  initialData?: WeeklyPM25ForecastItem;
};

export default function ClientWeeklyPM25Forecast({ initialData }: Props) {
  // 서버 데이터가 없는 경우에만 클라이언트 쿼리 실행
  const { data, isLoading, isError } = useQuery({
    queryKey: ['airQuality', 'weeklyPM25Forecast'],
    queryFn: fetchWeeklyPM25Forecast,
    staleTime: 3 * 60 * 60 * 1000, // 3시간
    enabled: !initialData,
  });

  // 데이터 소스 결정 (서버 데이터 우선, 없으면 클라이언트 데이터)
  const item = initialData || data?.response?.body?.items?.[0];

  // 로딩 상태 확인
  const isClientLoading = !initialData && isLoading;

  if (isClientLoading) {
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
