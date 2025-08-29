import { SidoAirQualityItem } from '@/features/air-quality/types';
import AirQualityGrade from '../atoms/AirQualityGrade';
import PollutantValue from '../molecules/PollutantValue';

type Props = {
  data: SidoAirQualityItem;
};

export default function AirQualitySummary({ data }: Props) {
  if (!data) return null;

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center border-b border-border pb-3'>
        <div className='flex flex-col justify-between gap-2 flex-wrap items-center sm:items-start'>
          <h4 className='text-xl font-bold mt-1'>{data.sidoName}</h4>
          <p className='text-sm text-muted-foreground'>측정 시간: {data.dataTime}</p>
        </div>
        <div className='flex flex-col items-center'>
          <div className='text-lg font-semibold mb-1'>통합 대기 환경</div>
          <AirQualityGrade
            grade={data.khaiGrade}
            size='lg'
          />
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
        <PollutantValue
          name='pm10'
          value={data.pm10Value}
          grade={data.pm10Grade}
        />
        <PollutantValue
          name='pm25'
          value={data.pm25Value}
          grade={data.pm25Grade}
        />
        <PollutantValue
          name='o3'
          value={data.o3Value}
          grade={data.o3Grade}
          unit='ppm'
        />
        <PollutantValue
          name='no2'
          value={data.no2Value}
          grade={data.no2Grade}
          unit='ppm'
        />
        <PollutantValue
          name='co'
          value={data.coValue}
          grade={data.coGrade}
          unit='ppm'
        />
        <PollutantValue
          name='so2'
          value={data.so2Value}
          grade={data.so2Grade}
          unit='ppm'
        />
      </div>
    </div>
  );
}
