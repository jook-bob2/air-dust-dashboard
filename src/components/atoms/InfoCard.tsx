import React from 'react';

type Props = {
  title: string;
  children: React.ReactNode;
  className?: string;
};

export default function InfoCard({ title, children, className = '' }: Props) {
  return (
    <div className={`bg-card text-card-foreground rounded-lg shadow-md p-4 ${className}`}>
      <h3 className='text-lg font-semibold mb-3'>{title}</h3>
      <div>{children}</div>
    </div>
  );
}
