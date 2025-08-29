import { SidoAirQualityItem } from '@/features/air-quality/types';
import AirQualitySummary from './AirQualitySummary';
import AirQualityList from './AirQualityList';

type Props = {
  data: SidoAirQualityItem[];
};

export default function SidoAirQuality({ data }: Props) {
  if (!data || data.length === 0) {
    return <div className='text-center py-8'>측정 데이터가 없습니다.</div>;
  }

  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-center gap-2 flex-wrap bg-muted/20 p-3 rounded-md'>
        <h3 className='text-lg font-medium mb-1'>{data[0].stationName} 측정소</h3>
        <p className='text-sm text-muted-foreground'>측정 시각: {data[0].dataTime}</p>
      </div>
      <AirQualitySummary data={data[0]} />
      <AirQualityList items={data.slice(0, 10)} />
    </div>
  );
}
