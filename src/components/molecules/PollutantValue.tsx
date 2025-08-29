import AirQualityGrade from '../atoms/AirQualityGrade';
import { POLLUTANT_NAMES } from '@/features/air-quality/constants';

type Props = {
  name: keyof typeof POLLUTANT_NAMES;
  value: string;
  grade: string | null;
  unit?: string;
};

export default function PollutantValue({ name, value, grade, unit = 'μg/m³' }: Props) {
  const label = POLLUTANT_NAMES[name];
  const showUnit = name !== 'khai';
  const normalizedGrade = grade ?? '-';

  return (
    <div className='min-w-0 rounded-md border px-3 py-2 flex sm:flex-row flex-col sm:items-center gap-2 sm:justify-between'>
      <div className='font-medium text-sm sm:text-base whitespace-nowrap xl:whitespace-normal xl:overflow-visible xl:text-clip sm:flex-1'>{label}</div>
      <div className='flex items-center gap-2 sm:ml-auto'>
        <div className='text-right whitespace-nowrap'>
          <span className='text-base sm:text-lg font-semibold'>{value}</span>
          {showUnit && <span className='text-xs text-muted-foreground ml-1'>{unit}</span>}
        </div>
        <AirQualityGrade
          grade={normalizedGrade}
          size='sm'
          showText={false}
        />
      </div>
    </div>
  );
}
