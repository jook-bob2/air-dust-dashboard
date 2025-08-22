import AirQualityGrade from '../atoms/AirQualityGrade';
import { POLLUTANT_NAMES } from '@/features/air-quality/constants';

type Props = {
  name: keyof typeof POLLUTANT_NAMES;
  value: string;
  grade: string;
  unit?: string;
};

export default function PollutantValue({ name, value, grade, unit = 'μg/m³' }: Props) {
  const label = POLLUTANT_NAMES[name];
  const showUnit = name !== 'khai';

  return (
    <div className='flex items-center justify-between p-2 border-b border-border last:border-0'>
      <div className='font-medium'>{label}</div>
      <div className='flex items-center gap-3'>
        <div className='text-right'>
          <span className='text-lg font-semibold'>{value}</span>
          {showUnit && <span className='text-xs text-muted-foreground ml-1'>{unit}</span>}
        </div>
        <AirQualityGrade grade={grade} size='sm' showText={false} />
      </div>
    </div>
  );
}
