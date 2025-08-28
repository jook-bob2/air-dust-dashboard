'use client';

import { SidoAirQualityItem } from '@/features/air-quality/types';
import AirQualityGrade from '../atoms/AirQualityGrade';

type Props = {
  items: SidoAirQualityItem[];
  onSelectStation?: (station: string) => void;
};

export default function AirQualityList({ items, onSelectStation }: Props) {
  if (!items || items.length === 0) {
    return <div className='text-center py-8'>측정 데이터가 없습니다.</div>;
  }

  return (
    <div className='overflow-x-auto'>
      <table className='w-full'>
        <thead>
          <tr className='bg-muted'>
            <th className='p-2 text-left'>측정소</th>
            <th className='p-2 text-center'>통합지수</th>
            <th className='p-2 text-center'>미세먼지</th>
            <th className='p-2 text-center'>초미세먼지</th>
            <th className='p-2 text-center'>오존</th>
          </tr>
        </thead>
        <tbody>
          {items.map(item => (
            <tr
              key={item.stationName}
              className='border-b border-border hover:bg-muted/50 cursor-pointer'
              onClick={() => onSelectStation && onSelectStation(item.stationName)}>
              <td className='p-2'>{item.stationName}</td>
              <td className='p-2'>
                <div className='flex justify-center'>
                  <AirQualityGrade
                    grade={item.khaiGrade}
                    size='sm'
                    showText={false}
                  />
                </div>
              </td>
              <td className='p-2'>
                <div className='flex justify-center'>
                  <AirQualityGrade
                    grade={item.pm10Grade}
                    size='sm'
                    showText={false}
                  />
                </div>
              </td>
              <td className='p-2'>
                <div className='flex justify-center'>
                  <AirQualityGrade
                    grade={item.pm25Grade}
                    size='sm'
                    showText={false}
                  />
                </div>
              </td>
              <td className='p-2'>
                <div className='flex justify-center'>
                  <AirQualityGrade
                    grade={item.o3Grade}
                    size='sm'
                    showText={false}
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
