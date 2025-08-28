import { GRADE_COLORS, GRADE_TEXT } from '@/features/air-quality/constants';

type Props = {
  grade: string | null;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
};

export default function AirQualityGrade({ grade, size = 'md', showText = true }: Props) {
  const sizeClasses = {
    sm: 'h-4 w-4 text-xs',
    md: 'h-6 w-6 text-sm',
    lg: 'h-8 w-8 text-base',
  };

  const normalizedGrade = grade ?? '-';

  return (
    <div className='flex items-center gap-2'>
      <div
        className={`${GRADE_COLORS[normalizedGrade as keyof typeof GRADE_COLORS] || 'bg-gray-300'} ${sizeClasses[size]} rounded-full flex items-center justify-center`}
      >
        {!showText && normalizedGrade !== '-' && (
          <span className='text-white font-bold'>{normalizedGrade}</span>
        )}
      </div>
      {showText && (
        <span className='text-foreground'>
          {GRADE_TEXT[normalizedGrade as keyof typeof GRADE_TEXT] || '정보없음'}
        </span>
      )}
    </div>
  );
}
