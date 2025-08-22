import React from 'react';

type Props = {
  title: string;
  children: React.ReactNode;
  fullWidth?: boolean;
};

export default function DashboardCard({ title, children, fullWidth = false }: Props) {
  return (
    <div className={`bg-card rounded-lg shadow-sm ${fullWidth ? 'col-span-full' : ''}`}>
      <div className='p-4 border-b border-border'>
        <h2 className='text-lg font-semibold'>{title}</h2>
      </div>
      <div className='p-4'>
        {children}
      </div>
    </div>
  );
}
