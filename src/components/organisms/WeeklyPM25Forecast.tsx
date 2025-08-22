import { WeeklyPM25ForecastItem } from '@/features/air-quality/types';
import InfoCard from '../atoms/InfoCard';
import Image from 'next/image';

type Props = {
  data?: WeeklyPM25ForecastItem;
};

export default function WeeklyPM25Forecast({ data }: Props) {
  if (!data) {
    return <div className='text-center py-8'>예보 데이터가 없습니다.</div>;
  }

  return (
    <div className='space-y-3'>
        <div>
          <p className='text-sm text-muted-foreground'>발표시간: {data.dataTime}</p>
          <h4 className='font-medium mt-1'>예보 구분: {data.informCode}</h4>
        </div>

        {data.informGrade && (
          <div className='bg-muted p-3 rounded'>
            <h5 className='font-semibold mb-2'>지역별 등급</h5>
            <p>{data.informGrade}</p>
          </div>
        )}

        {data.informCause && (
          <div className='bg-muted p-3 rounded'>
            <h5 className='font-semibold mb-2'>발생 원인</h5>
            <p>{data.informCause}</p>
          </div>
        )}

        <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mt-4'>
          {data.imageUrl1 && (
            <div className='flex flex-col items-center'>
              <h5 className='text-sm font-medium mb-2'>첫째날</h5>
              <div className='relative w-full h-64 border border-border rounded overflow-hidden'>
                <Image 
                  src={data.imageUrl1} 
                  alt='첫째날 예보' 
                  fill 
                  className='object-contain' 
                />
              </div>
            </div>
          )}

          {data.imageUrl2 && (
            <div className='flex flex-col items-center'>
              <h5 className='text-sm font-medium mb-2'>둘째날</h5>
              <div className='relative w-full h-64 border border-border rounded overflow-hidden'>
                <Image 
                  src={data.imageUrl2} 
                  alt='둘째날 예보' 
                  fill 
                  className='object-contain' 
                />
              </div>
            </div>
          )}

          {data.imageUrl3 && (
            <div className='flex flex-col items-center'>
              <h5 className='text-sm font-medium mb-2'>셋째날</h5>
              <div className='relative w-full h-64 border border-border rounded overflow-hidden'>
                <Image 
                  src={data.imageUrl3} 
                  alt='셋째날 예보' 
                  fill 
                  className='object-contain' 
                />
              </div>
            </div>
          )}
        </div>
      </div>
  );
}
