'use client';

import { useQuery } from '@tanstack/react-query';
import { AirQualityForecast, ForecastSkeleton } from '@/components';
import { fetchAirQualityForecast } from '@/features/air-quality/api';
import { AirQualityForecastItem } from '@/features/air-quality/types';

type Props = {
  initialData?: AirQualityForecastItem[];
};

export default function ClientAirQualityForecast({ initialData }: Props) {
  // 서버 데이터가 없는 경우에만 클라이언트 쿼리 실행
  const { data, isLoading, isError } = useQuery({
    queryKey: ['airQuality', 'forecast'],
    queryFn: fetchAirQualityForecast,
    staleTime: 30 * 60 * 1000, // 30분
    enabled: !initialData || initialData.length === 0,
  });

  // 데이터 소스 결정 (서버 데이터 우선, 없으면 클라이언트 데이터)
  const items = initialData?.length ? initialData : (data?.response?.body?.items ?? []);

  // 로딩 상태 확인
  const isClientLoading = !initialData && isLoading;

  if (isClientLoading) {
    return <ForecastSkeleton />;
  }

  if (items.length === 0) {
    return (
      <div className='text-center py-8 text-muted-foreground'>
        <p>예보 데이터가 없습니다.</p>
        {isError && <p className='text-sm mt-2'>데이터를 불러오는 중 오류가 발생했습니다.</p>}
      </div>
    );
  }

  return <AirQualityForecast data={items} />;
}
