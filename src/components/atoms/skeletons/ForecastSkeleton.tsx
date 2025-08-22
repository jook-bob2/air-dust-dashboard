import Skeleton from '../Skeleton';

export default function ForecastSkeleton() {
  return (
    <div className='space-y-3'>
      <div className='flex items-center justify-between'>
        <Skeleton className='h-5 w-24' />
        <Skeleton className='h-5 w-32' />
      </div>

      <Skeleton className='h-36 p-4'>
        <div className='flex flex-col h-full justify-between'>
          <Skeleton
            className='h-4 w-3/4'
            variant='rectangular'
          />
          <div className='space-y-2'>
            {[...Array(3)].map((_, i) => (
              <Skeleton
                key={i}
                className='h-4 w-full'
                variant='rectangular'
              />
            ))}
          </div>
        </div>
      </Skeleton>

      <div className='grid grid-cols-2 sm:grid-cols-4 gap-3'>
        {[...Array(4)].map((_, i) => (
          <Skeleton
            key={i}
            className='h-20'
          />
        ))}
      </div>
    </div>
  );
}
