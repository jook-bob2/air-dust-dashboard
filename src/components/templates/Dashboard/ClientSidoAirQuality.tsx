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

// ApiResponse 래퍼 (컴포넌트 로컬)
function wrapSido(items: SidoAirQualityItem[]) {
  return {
    response: {
      header: { resultCode: '00', resultMsg: 'OK' },
      body: { totalCount: items.length, pageNo: 1, numOfRows: items.length, items },
    },
  } as const;
}

export default function ClientSidoAirQuality({
  sidoName: initialSidoName,
  initialData,
  onSidoChange,
  showSelector = true,
}: Props) {
  const [selectedSido, setSelectedSido] = useState(initialSidoName);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['airQuality', 'sido', selectedSido],
    queryFn: () => fetchAirQualityBySido(selectedSido),
    staleTime: 10 * 60 * 1000, // 10분
    // 초기 시도명과 선택된 시도가 같고, 서버 초기 데이터가 있을 경우 초기 데이터 주입
    initialData:
      selectedSido === initialSidoName && initialData && initialData.length > 0 ? wrapSido(initialData) : undefined,
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

  const items = data?.response?.body?.items ?? [];

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

      {isLoading ? (
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
