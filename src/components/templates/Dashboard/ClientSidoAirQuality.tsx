'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { SidoAirQuality, SidoSelector, SidoAirQualitySkeleton } from '@/components';
import { fetchAirQualityBySido } from '@/features/air-quality/api';
import { SidoAirQualityItem } from '@/features/air-quality/types';

type Props = {
  sidoName: string;
  initialData?: SidoAirQualityItem[];
  onSidoChange?: (sido: string) => void;
  showSelector?: boolean;
};

export default function ClientSidoAirQuality({
  sidoName: initialSidoName,
  initialData,
  onSidoChange,
  showSelector = true,
}: Props) {
  const [selectedSido, setSelectedSido] = useState(initialSidoName);

  // 서버 데이터가 없는 경우에만 클라이언트 쿼리 실행
  const { data, isLoading, isError } = useQuery({
    queryKey: ['airQuality', 'sido', selectedSido],
    queryFn: () => fetchAirQualityBySido(selectedSido),
    staleTime: 10 * 60 * 1000, // 10분
    enabled: !initialData || initialData.length === 0,
  });

  // 외부 컴포넌트에 선택된 시도 변경을 알림
  useEffect(() => {
    if (onSidoChange && selectedSido !== initialSidoName) {
      onSidoChange(selectedSido);
    }
  }, [selectedSido, initialSidoName, onSidoChange]);

  // 시도 선택 핸들러
  const handleSidoChange = (sido: string) => {
    setSelectedSido(sido);
  };

  // 데이터 소스 결정 (서버 데이터 우선, 없으면 클라이언트 데이터)
  const items = initialData?.length ? initialData : (data?.response?.body?.items ?? []);

  // 로딩 상태 확인
  const isClientLoading = !initialData && isLoading;

  return (
    <div>
      {showSelector && (
        <div className='flex items-center justify-end mb-4'>
          <div className='w-48'>
            <SidoSelector
              selectedSido={selectedSido}
              onSelect={handleSidoChange}
            />
          </div>
        </div>
      )}

      {isClientLoading ? (
        <SidoAirQualitySkeleton />
      ) : items.length > 0 ? (
        <SidoAirQuality data={items} />
      ) : (
        <div className='text-center py-8 text-muted-foreground'>
          <p>측정 데이터가 없습니다.</p>
          {isError && <p className='text-sm mt-2'>데이터를 불러오는 중 오류가 발생했습니다.</p>}
        </div>
      )}
    </div>
  );
}
