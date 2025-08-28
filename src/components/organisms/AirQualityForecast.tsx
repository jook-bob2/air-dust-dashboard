import { AirQualityForecastItem } from '@/features/air-quality/types';

type Props = {
  data?: AirQualityForecastItem[];
};

export default function AirQualityForecast({ data }: Props) {
  if (!data || data.length === 0) {
    return <div className='text-center py-8'>예보 데이터가 없습니다.</div>;
  }

  // 가장 최근 예보 데이터 사용
  const latestForecast = data[0];

  return (
    <div className='space-y-3'>
      <div>
        <p className='text-sm text-muted-foreground'>발표시간: {latestForecast.dataTime}</p>
        <h4 className='font-medium mt-1'>예보 구분: {latestForecast.informCode}</h4>
      </div>

      <div className='bg-muted p-3 rounded'>
        <h5 className='font-semibold mb-2'>전체 예보</h5>
        <p>{latestForecast.informOverall}</p>
      </div>

      {latestForecast.informGrade && (
        <div className='bg-muted p-3 rounded'>
          <h5 className='font-semibold mb-2'>지역별 등급</h5>
          <p>{latestForecast.informGrade}</p>
        </div>
      )}

      {latestForecast.informCause && (
        <div className='bg-muted p-3 rounded'>
          <h5 className='font-semibold mb-2'>발생 원인</h5>
          <p>{latestForecast.informCause}</p>
        </div>
      )}

      {latestForecast.actionKnack && (
        <div className='bg-muted p-3 rounded'>
          <h5 className='font-semibold mb-2'>행동요령</h5>
          <p>{latestForecast.actionKnack}</p>
        </div>
      )}
    </div>
  );
}
