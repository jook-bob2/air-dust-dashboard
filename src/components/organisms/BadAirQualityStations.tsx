import { BadAirQualityStationItem } from '@/features/air-quality/types';
import AirQualityGrade from '../atoms/AirQualityGrade';

type Props = {
  data?: BadAirQualityStationItem[];
  onSelectStation?: (station: string) => void;
};

export default function BadAirQualityStations({ data, onSelectStation }: Props) {
  if (!data || data.length === 0) {
    return (
      <div className='text-center py-8 border border-border rounded-md'>
        <p className='text-lg font-medium text-green-600'>현재 나쁨 이상 측정소가 없습니다.</p>
        <p className='text-sm text-muted-foreground mt-2'>
          서울, 부산, 인천, 대구, 광주, 대전 지역의 모든 측정소에서 대기질이 양호합니다.
        </p>
        <div className='mt-4 flex justify-center gap-4'>
          <div className='flex items-center gap-2'>
            <div className='w-3 h-3 rounded-full bg-blue-500'></div>
            <span className='text-sm'>좋음</span>
          </div>
          <div className='flex items-center gap-2'>
            <div className='w-3 h-3 rounded-full bg-green-500'></div>
            <span className='text-sm'>보통</span>
          </div>
          <div className='flex items-center gap-2'>
            <div className='w-3 h-3 rounded-full bg-yellow-500'></div>
            <span className='text-sm'>나쁨</span>
          </div>
          <div className='flex items-center gap-2'>
            <div className='w-3 h-3 rounded-full bg-red-500'></div>
            <span className='text-sm'>매우나쁨</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='overflow-x-auto'>
      <div className='bg-destructive/10 p-3 rounded-md mb-4 text-sm'>
        <p className='font-medium text-destructive'>주의: 아래 측정소들의 대기질이 나쁨 이상으로 측정되었습니다.</p>
        <p className='text-muted-foreground mt-1'>외출 시 마스크 착용을 권장하며, 호흡기 질환자는 외출을 자제하세요.</p>
      </div>
      <table className='w-full'>
        <thead>
          <tr className='bg-muted'>
            <th className='p-3 text-left font-medium'>측정소</th>
            <th className='p-3 text-left font-medium'>주소</th>
            <th className='p-3 text-center font-medium'>지수</th>
            <th className='p-3 text-center font-medium'>등급</th>
            <th className='p-3 text-left font-medium'>시도</th>
          </tr>
        </thead>
        <tbody>
          {(data ?? [])
            .slice()
            .sort((a, b) => {
              if (a.sidoName === b.sidoName) {
                if (a.stationName === b.stationName) return 0;
                return a.stationName < b.stationName ? -1 : 1;
              }
              return a.sidoName < b.sidoName ? -1 : 1;
            })
            .map(item => (
              <tr
                key={`${item.sidoName}-${item.stationName}`}
                className='border-b border-border hover:bg-muted/50 cursor-pointer'
                onClick={() => onSelectStation && onSelectStation(item.stationName)}>
                <td className='p-3 font-medium'>{item.stationName}</td>
                <td className='p-3 text-sm'>{item.addr}</td>
                <td className='p-3 text-center font-bold'>{item.khaiValue}</td>
                <td className='p-3'>
                  <div className='flex justify-center'>
                    <AirQualityGrade
                      grade={item.khaiGrade}
                      size='sm'
                    />
                  </div>
                </td>
                <td className='p-3'>{item.sidoName}</td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
