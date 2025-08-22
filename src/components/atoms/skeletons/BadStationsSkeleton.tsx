import Skeleton from '../Skeleton';

export default function BadStationsSkeleton() {
  return (
    <div className='overflow-x-auto'>
      <Skeleton className='h-16 w-full mb-4 p-3'>
        <div className='flex flex-col gap-2'>
          <Skeleton
            className='h-4 w-3/4'
            variant='rectangular'
          />
          <Skeleton
            className='h-3 w-1/2'
            variant='rectangular'
          />
        </div>
      </Skeleton>

      <table className='w-full'>
        <thead>
          <tr className='bg-muted'>
            {['측정소', '주소', '지수', '등급', '시도'].map((_, i) => (
              <th
                key={i}
                className='p-3 text-left'>
                <Skeleton className='h-5 w-16' />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[...Array(4)].map((_, i) => (
            <tr
              key={i}
              className='border-b border-border'>
              {[...Array(5)].map((_, j) => (
                <td
                  key={j}
                  className='p-3'>
                  <Skeleton className={`h-5 ${j === 2 ? 'w-8 mx-auto' : 'w-full'}`} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
