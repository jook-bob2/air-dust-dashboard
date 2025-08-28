'use client';

import { useQuery } from '@tanstack/react-query';
import { AirQualityForecast, ForecastSkeleton } from '@/components';
import { fetchAirQualityForecast } from '@/features/air-quality/api';
import { AirQualityForecastItem } from '@/features/air-quality/types';

type Props = {
  initialData?: AirQualityForecastItem[];
};

function wrapForecast(items: AirQualityForecastItem[]) {
  return {
    response: {
      header: { resultCode: '00', resultMsg: 'OK' },
      body: { totalCount: items.length, pageNo: 1, numOfRows: items.length, items },
    },
  } as const;
}

export default function ClientAirQualityForecast({ initialData }: Props) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['airQuality', 'forecast'],
    queryFn: fetchAirQualityForecast,
    staleTime: 30 * 60 * 1000, // 30분
    initialData: initialData && initialData.length > 0 ? wrapForecast(initialData) : undefined,
  });

  const items = data?.response?.body?.items ?? [];

  if (isLoading) {
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
