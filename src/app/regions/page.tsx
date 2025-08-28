import { Suspense } from 'react';
import type { Metadata } from 'next';
import { MainLayout, DashboardCard, SidoAirQualitySkeleton } from '@/components';
import { ErrorBoundaryWrapper } from '@/components/ErrorBoundaryWrapper';
import { fetchAirQualityBySido } from '@/features/air-quality/api';
import ClientRegions from '@/components/templates/Regions/ClientRegions';
import { HydrationBoundary, dehydrate, QueryClient } from '@tanstack/react-query';

export const revalidate = 3600; // 데이터 갱신 주기: 1시간

export const metadata: Metadata = {
  title: '지역별 현황 - 미세먼지 알리미',
  description: '전국/시도/시군구 단계적 선택으로 실시간 미세먼지(PM10, PM2.5) 정보를 확인하세요.',
};

async function InitialRegionsSection() {
  const defaultSido = '서울';
  try {
    const queryClient = new QueryClient();
    await queryClient.prefetchQuery({
      queryKey: ['airQuality', 'sido', defaultSido],
      queryFn: () => fetchAirQualityBySido(defaultSido),
      staleTime: 10 * 60 * 1000, // 10분
    });
    const dehydratedState = dehydrate(queryClient);
    return (
      <HydrationBoundary state={dehydratedState}>
        <ClientRegions initialSido={defaultSido} />
      </HydrationBoundary>
    );
  } catch (e) {
    console.error('서버에서 지역별 데이터 프리패치 실패, 클라이언트 위임:', e);
    return <ClientRegions initialSido={defaultSido} />;
  }
}

export default function RegionsPage() {
  return (
    <MainLayout>
      <div className='container mx-auto p-6 space-y-6'>
        <h1 className='text-3xl font-bold text-foreground'>지역별 현황</h1>
        <p className='text-muted-foreground'>
          전국 → 시도 → 시군구 단계로 선택하고, 리스트 또는 지도 방식으로 대기질 정보를 확인하세요.
        </p>

        <DashboardCard
          title='지역 선택 및 현황'
          fullWidth>
          <Suspense fallback={<SidoAirQualitySkeleton />}>
            <ErrorBoundaryWrapper>
              {/* 서버에서 선로딩 실패 시 자동으로 클라이언트가 데이터를 로드 */}
              <InitialRegionsSection />
            </ErrorBoundaryWrapper>
          </Suspense>
        </DashboardCard>
      </div>
    </MainLayout>
  );
}
