import { Suspense } from 'react';
import {
  MainLayout,
  DashboardCard,
  SidoAirQualitySkeleton,
  ForecastSkeleton,
  BadStationsSkeleton,
  RealTimeSidoAirQualitySkeleton,
} from '@/components';
import { ErrorBoundaryWrapper } from '@/components/ErrorBoundaryWrapper';
import {
  ClientSidoAirQuality,
  ClientAirQualityForecast,
  ClientWeeklyPM25Forecast,
  ClientBadAirQualityStations,
} from '@/components/templates/Dashboard';
import {
  fetchAirQualityBySido,
  fetchAirQualityForecast,
  fetchWeeklyPM25Forecast,
  fetchBadAirQualityStations,
} from '@/features/air-quality/api';

// 서버 컴포넌트: 서버에서 데이터 패칭 후 initialData로 전달 (Next fetch 메모이제이션 활용)
async function SidoAirQualitySection({ sidoName }: { sidoName: string }) {
  try {
    const data = await fetchAirQualityBySido(sidoName);
    const items = data?.response?.body?.items ?? [];
    return (
      <ClientSidoAirQuality
        sidoName={sidoName}
        initialData={items}
      />
    );
  } catch (error) {
    console.error(`서버에서 ${sidoName} 데이터를 가져오는 중 오류:`, error);
    return <ClientSidoAirQuality sidoName={sidoName} />;
  }
}

async function AirQualityForecastSection() {
  try {
    const data = await fetchAirQualityForecast();
    const items = data?.response?.body?.items ?? [];
    return <ClientAirQualityForecast initialData={items} />;
  } catch (error) {
    console.error('대기질 예보 섹션 서버 패칭 중 오류:', error);
    return <ClientAirQualityForecast />;
  }
}

async function WeeklyPM25ForecastSection() {
  try {
    const data = await fetchWeeklyPM25Forecast();
    const item = data?.response?.body?.items?.[0];
    return <ClientWeeklyPM25Forecast initialData={item} />;
  } catch (error) {
    console.error('주간 예보 섹션 서버 패칭 중 오류:', error);
    return <ClientWeeklyPM25Forecast />;
  }
}

async function BadStationsSection() {
  try {
    const data = await fetchBadAirQualityStations();
    const items = data?.response?.body?.items ?? [];
    return <ClientBadAirQualityStations initialData={items} />;
  } catch (error) {
    console.error('나쁨 이상 측정소 섹션 서버 패칭 중 오류:', error);
    return <ClientBadAirQualityStations />;
  }
}

export default async function Dashboard() {
  const defaultSido = '서울';

  return (
    <MainLayout>
      <div className='container mx-auto p-6 space-y-6'>
        <div className='flex items-center justify-between'>
          <h1 className='text-3xl font-bold text-foreground'>대기질 대시보드</h1>
        </div>

        {/* 실시간 시도별 대기질 (전체 클라이언트 컴포넌트) */}
        <DashboardCard
          title='실시간 시도별 대기질'
          fullWidth>
          <div className='flex items-center justify-between mb-5'>
            <p className='text-muted-foreground'>시도를 선택하여 실시간 대기질 정보를 확인하세요</p>
          </div>
          <Suspense fallback={<RealTimeSidoAirQualitySkeleton />}>
            <SidoAirQualitySection sidoName={defaultSido} />
          </Suspense>
        </DashboardCard>

        {/* 서버 컴포넌트 (RSC) + 클라이언트 폴백 */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          <DashboardCard title='시도별 대기질 현황'>
            <Suspense fallback={<SidoAirQualitySkeleton />}>
              <ErrorBoundaryWrapper>
                <SidoAirQualitySection sidoName={defaultSido} />
              </ErrorBoundaryWrapper>
            </Suspense>
          </DashboardCard>

          <div className='space-y-6'>
            <DashboardCard title='대기질 예보통보'>
              <Suspense fallback={<ForecastSkeleton />}>
                <ErrorBoundaryWrapper>
                  <AirQualityForecastSection />
                </ErrorBoundaryWrapper>
              </Suspense>
            </DashboardCard>

            <DashboardCard title='초미세먼지 주간예보'>
              <Suspense fallback={<ForecastSkeleton />}>
                <ErrorBoundaryWrapper>
                  <WeeklyPM25ForecastSection />
                </ErrorBoundaryWrapper>
              </Suspense>
            </DashboardCard>
          </div>
        </div>

        {/* 통합대기환경지수 나쁨 이상 측정소 목록 */}
        <DashboardCard
          title='통합대기환경지수 나쁨 이상 측정소'
          fullWidth>
          <Suspense fallback={<BadStationsSkeleton />}>
            <ErrorBoundaryWrapper>
              <BadStationsSection />
            </ErrorBoundaryWrapper>
          </Suspense>
        </DashboardCard>

        {/* 다른 지역 대기질 정보 */}
        <DashboardCard
          title='측정소별 대기질 정보'
          fullWidth>
          <Suspense fallback={<SidoAirQualitySkeleton />}>
            <ErrorBoundaryWrapper>
              <SidoAirQualitySection sidoName={defaultSido} />
            </ErrorBoundaryWrapper>
          </Suspense>
        </DashboardCard>
      </div>
    </MainLayout>
  );
}
