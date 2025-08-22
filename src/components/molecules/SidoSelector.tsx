'use client';

import { useState, useRef, useEffect } from 'react';
import { SIDO_LIST } from '@/features/air-quality/constants';

type Props = {
  selectedSido: string;
  onSelect: (sido: string) => void;
};

export default function SidoSelector({ selectedSido, onSelect }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div
      ref={dropdownRef}
      className='relative'>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className='flex items-center justify-between w-full px-4 py-2 text-left bg-background border border-input rounded-md shadow-sm hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary'>
        <span>{selectedSido}</span>
        <svg
          className='w-5 h-5 ml-2'
          viewBox='0 0 20 20'
          fill='currentColor'>
          <path
            fillRule='evenodd'
            d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z'
            clipRule='evenodd'
          />
        </svg>
      </button>

      {isOpen && (
        <div className='absolute z-10 w-full mt-1 bg-popover border border-input rounded-md shadow-lg max-h-60 overflow-auto'>
          <ul className='py-1'>
            {SIDO_LIST.map(sido => (
              <li key={sido}>
                <button
                  onClick={() => {
                    onSelect(sido);
                    setIsOpen(false);
                  }}
                  className={`block w-full px-4 py-2 text-left hover:bg-accent hover:text-accent-foreground ${selectedSido === sido ? 'bg-primary text-primary-foreground' : 'text-popover-foreground'}`}>
                  {sido}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
