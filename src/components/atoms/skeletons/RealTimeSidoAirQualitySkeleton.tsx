import Skeleton from '../Skeleton';

export default function RealTimeSidoAirQualitySkeleton() {
  return (
    <div>
      <div className='flex items-center justify-between mb-5'>
        <Skeleton className='h-5 w-64' />
        <Skeleton className='h-9 w-48' />
      </div>

      <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-4'>
        {[...Array(4)].map((_, i) => (
          <Skeleton
            key={i}
            className='h-24 p-3'>
            <div className='flex flex-col h-full justify-between'>
              <Skeleton
                className='h-4 w-20'
                variant='rectangular'
              />
              <div className='flex items-baseline gap-2'>
                <Skeleton
                  className='h-7 w-10'
                  variant='rectangular'
                />
                <Skeleton
                  className='h-4 w-10'
                  variant='rectangular'
                />
              </div>
              <Skeleton
                className='h-3 w-16'
                variant='rectangular'
              />
            </div>
          </Skeleton>
        ))}
      </div>

      <div className='space-y-3'>
        <div className='flex justify-between'>
          <Skeleton className='h-6 w-40' />
          <Skeleton className='h-6 w-36' />
        </div>

        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead>
              <tr className='bg-muted/30'>
                {['측정소', '미세먼지', '초미세먼지', '통합지수', '등급', '시간'].map((_, i) => (
                  <th
                    key={i}
                    className='p-3'>
                    <Skeleton className='h-5 w-16 mx-auto' />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...Array(6)].map((_, i) => (
                <tr
                  key={i}
                  className='border-b border-border'>
                  {[...Array(6)].map((_, j) => (
                    <td
                      key={j}
                      className='p-3 text-center'>
                      <Skeleton className={`h-5 ${j === 0 ? 'w-24' : j === 5 ? 'w-16' : 'w-12'} mx-auto`} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
