import { cn } from '@/lib/utils';
import React from 'react';

type Props = {
  className?: string;
  animated?: boolean;
  variant?: 'rounded' | 'circular' | 'rectangular';
  children?: React.ReactNode;
};

export default function Skeleton({ 
  className, 
  animated = true, 
  variant = 'rounded',
  children 
}: Props) {
  return (
    <div
      className={cn(
        'bg-muted/40', 
        variant === 'rounded' && 'rounded-md', 
        variant === 'circular' && 'rounded-full',
        animated && 'animate-pulse',
        className
      )}
    >
      {children}
    </div>
  );
}
