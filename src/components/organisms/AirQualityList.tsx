'use client';

import { SidoAirQualityItem } from '@/features/air-quality/types';
import AirQualityGrade from '../atoms/AirQualityGrade';
import { $modal } from '@/lib/alerts';
import { ReactDOMServer } from 'next/dist/server/route-modules/app-page/vendored/ssr/entrypoints';

type Props = {
  items: SidoAirQualityItem[];
  onSelectStation?: (station: string) => void;
};

function safe(v?: string | null) {
  return v && v !== '-' ? v : '-';
}

function gradeLabel(grade?: string | null) {
  switch (grade) {
    case '1':
      return '좋음';
    case '2':
      return '보통';
    case '3':
      return '나쁨';
    case '4':
      return '매우나쁨';
    default:
      return '-';
  }
}

function gradeBgClass(grade?: string | null) {
  switch (grade) {
    case '1':
      return 'bg-green-500';
    case '2':
      return 'bg-blue-500';
    case '3':
      return 'bg-amber-500';
    case '4':
      return 'bg-red-500';
    default:
      return 'bg-gray-500';
  }
}

function DetailContent({ item }: { item: SidoAirQualityItem }) {
  const pill = (label: string, value: string | null | undefined, unit = '') => {
    const text = safe(value);
    return (
      <div className='flex justify-between items-center p-2 px-2.5 rounded-lg bg-black/5 border border-black/10 mt-1.5'>
        <div className='text-xs text-gray-500'>{label}</div>
        <div className='font-semibold'>{text === '-' ? '-' : `${text}${unit}`}</div>
      </div>
    );
  };

  return (
    <div>
      <div className='flex flex-col gap-1.5 text-left mb-2'>
        <div className='text-xs text-slate-500'>{`${item.sidoName} · ${item.stationName}`}</div>
        <div className='flex flex-wrap items-center gap-2 justify-between'>
          <span
            className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-white font-semibold text-center ${gradeBgClass(item.khaiGrade)}`}>
            통합지수 {gradeLabel(item.khaiGrade)}
          </span>
          <span className='text-xs text-slate-500 whitespace-nowrap'>측정시각 {item.dataTime}</span>
        </div>
      </div>

      <div className='grid grid-cols-1 gap-2 xsm:grid-cols-2'>
        {pill('PM10(미세먼지)', item.pm10Value, ' ㎍/m³')}
        {pill('PM2.5(초미세먼지)', item.pm25Value, ' ㎍/m³')}
        {pill('O₃(오존)', item.o3Value, ' ppm')}
        {pill('NO₂(이산화질소)', item.no2Value, ' ppm')}
        {pill('SO₂(아황산가스)', item.so2Value, ' ppm')}
        {pill('CO(일산화탄소)', item.coValue, ' ppm')}
      </div>
    </div>
  );
}

export default function AirQualityList({ items, onSelectStation }: Props) {
  if (!items || items.length === 0) {
    return <div className='text-center py-8'>측정 데이터가 없습니다.</div>;
  }

  const handleRowClick = async (item: SidoAirQualityItem) => {
    try {
      onSelectStation?.(item.stationName);
      await $modal({
        icon: 'info',
        title: `${item.stationName} 측정소 상세`,
        html: ReactDOMServer.renderToString(<DetailContent item={item} />),
        width: 560,
        confirmButtonText: '닫기',
        focusConfirm: true,
        showCloseButton: true,
        backdrop: true,
      });
    } catch (e) {
      // no-op; modal throws in SSR, but this is client component
      console.log('handleRowClick error ', e);
    }
  };

  return (
    <div className='overflow-x-auto'>
      <table className='w-full min-w-[520px]'>
        <thead>
          <tr className='bg-muted'>
            <th className='p-2 text-left whitespace-nowrap'>측정소</th>
            <th className='p-2 text-center whitespace-nowrap'>통합지수</th>
            <th className='p-2 text-center whitespace-nowrap'>미세먼지</th>
            <th className='p-2 text-center whitespace-nowrap'>초미세먼지</th>
            <th className='p-2 text-center whitespace-nowrap'>오존</th>
          </tr>
        </thead>
        <tbody>
          {items.map(item => (
            <tr
              key={item.stationName}
              className='border-b border-border hover:bg-muted/50 cursor-pointer'
              onClick={() => handleRowClick(item)}>
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
