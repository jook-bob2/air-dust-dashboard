import { GRADE_COLORS, GRADE_TEXT } from '@/features/air-quality/constants';

type Props = {
  grade: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
};

export default function AirQualityGrade({ grade, size = 'md', showText = true }: Props) {
  const sizeClasses = {
    sm: 'h-4 w-4 text-xs',
    md: 'h-6 w-6 text-sm',
    lg: 'h-8 w-8 text-base',
  };

  return (
    <div className='flex items-center gap-2'>
      <div 
        className={`${GRADE_COLORS[grade as keyof typeof GRADE_COLORS] || 'bg-gray-300'} ${sizeClasses[size]} rounded-full flex items-center justify-center`}
      >
        {!showText && grade !== '-' && (
          <span className='text-white font-bold'>{grade}</span>
        )}
      </div>
      {showText && (
        <span className='text-foreground'>
          {GRADE_TEXT[grade as keyof typeof GRADE_TEXT] || '정보없음'}
        </span>
      )}
    </div>
  );
}
