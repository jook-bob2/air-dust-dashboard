'use client';

import { useQuery } from '@tanstack/react-query';
import { BadAirQualityStations, BadStationsSkeleton } from '@/components';
import { fetchBadAirQualityStations } from '@/features/air-quality/api';
import { BadAirQualityStationItem } from '@/features/air-quality/types';

type Props = {
  initialData?: BadAirQualityStationItem[];
};

function wrapBadStations(items: BadAirQualityStationItem[]) {
  return {
    response: {
      header: { resultCode: '00', resultMsg: 'OK' },
      body: { totalCount: items.length, pageNo: 1, numOfRows: items.length, items },
    },
  } as const;
}

export default function ClientBadAirQualityStations({ initialData }: Props) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['airQuality', 'badStations'],
    queryFn: fetchBadAirQualityStations,
    staleTime: 15 * 60 * 1000, // 15분
    initialData: initialData && initialData.length > 0 ? wrapBadStations(initialData) : undefined,
  });

  const items = data?.response?.body?.items ?? [];

  if (isLoading) {
    return <BadStationsSkeleton />;
  }

  if (items.length === 0) {
    return (
      <div className='text-center py-8 text-muted-foreground'>
        <p>현재 나쁨 이상의 측정소 데이터가 없습니다.</p>
        <p className='text-sm mt-2'>
          {isError
            ? '데이터를 불러오는 중 오류가 발생했습니다.'
            : '대기 상태가 양호하거나 일시적인 데이터 수집 문제일 수 있습니다.'}
        </p>
      </div>
    );
  }

  return <BadAirQualityStations data={items} />;
}
