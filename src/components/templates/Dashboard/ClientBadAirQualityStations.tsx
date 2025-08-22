'use client';

import { useQuery } from '@tanstack/react-query';
import { BadAirQualityStations, BadStationsSkeleton } from '@/components';
import { fetchBadAirQualityStations } from '@/features/air-quality/api';
import { BadAirQualityStationItem } from '@/features/air-quality/types';

type Props = {
  initialData?: BadAirQualityStationItem[];
};

export default function ClientBadAirQualityStations({ initialData }: Props) {
  // 서버 데이터가 없는 경우에만 클라이언트 쿼리 실행
  const { data, isLoading, isError } = useQuery({
    queryKey: ['airQuality', 'badStations'],
    queryFn: fetchBadAirQualityStations,
    staleTime: 15 * 60 * 1000, // 15분
    enabled: !initialData || initialData.length === 0,
  });

  // 데이터 소스 결정 (서버 데이터 우선, 없으면 클라이언트 데이터)
  const items = initialData?.length ? initialData : (data?.response?.body?.items ?? []);

  // 로딩 상태 확인
  const isClientLoading = !initialData && isLoading;

  if (isClientLoading) {
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
