import Skeleton from '../Skeleton';

export default function AirQualityListSkeleton() {
  return (
    <div className='overflow-x-auto'>
      <Skeleton className='h-10 w-full mb-3' />
      <table className='w-full'>
        <thead>
          <tr>
            {['측정소', '미세먼지', '초미세먼지', '통합지수', '등급', '시간'].map((_, i) => (
              <th
                key={i}
                className='p-3 text-left'>
                <Skeleton className='h-5 w-16' />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[...Array(5)].map((_, i) => (
            <tr
              key={i}
              className='border-b border-border'>
              {[...Array(6)].map((_, j) => (
                <td
                  key={j}
                  className='p-3'>
                  <Skeleton className='h-5 w-full' />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
