import Skeleton from '../Skeleton';
import AirQualitySummarySkeleton from './AirQualitySummarySkeleton';
import AirQualityListSkeleton from './AirQualityListSkeleton';

export default function SidoAirQualitySkeleton() {
  return (
    <div className='space-y-6'>
      <Skeleton className='h-16 w-full p-3'>
        <div className='flex flex-col gap-2'>
          <Skeleton
            className='h-5 w-1/3'
            variant='rectangular'
          />
          <Skeleton
            className='h-4 w-1/2'
            variant='rectangular'
          />
        </div>
      </Skeleton>

      <AirQualitySummarySkeleton />
      <AirQualityListSkeleton />
    </div>
  );
}
