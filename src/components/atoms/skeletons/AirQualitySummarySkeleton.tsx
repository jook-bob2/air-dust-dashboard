import Skeleton from '../Skeleton';

export default function AirQualitySummarySkeleton() {
  return (
    <div className='flex flex-col gap-4'>
      <Skeleton className='h-10 w-2/3' />

      <div className='grid grid-cols-2 sm:grid-cols-4 gap-3'>
        {[...Array(4)].map((_, i) => (
          <Skeleton
            key={i}
            className='h-24 p-3'>
            <div className='flex flex-col h-full justify-between'>
              <Skeleton
                className='h-3 w-1/2 mb-2'
                variant='rectangular'
              />
              <Skeleton
                className='h-6 w-3/4'
                variant='rectangular'
              />
              <Skeleton
                className='h-3 w-1/3'
                variant='rectangular'
              />
            </div>
          </Skeleton>
        ))}
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
        {[...Array(2)].map((_, i) => (
          <Skeleton
            key={i}
            className='h-16'
          />
        ))}
      </div>
    </div>
  );
}
