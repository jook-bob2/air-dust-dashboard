'use client';

import { useTheme } from '@/contexts/ThemeContext';
import { useState, useRef, useEffect } from 'react';

export default function ThemeSwitcher() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  console.log('theme:', theme);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const ThemeIcon = () => {
    if (resolvedTheme === 'dark') {
      return (
        <svg
          xmlns='http://www.w3.org/2000/svg'
          fill='none'
          viewBox='0 0 24 24'
          strokeWidth={1.5}
          stroke='currentColor'
          className='w-5 h-5'>
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            d='M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z'
          />
        </svg>
      );
    } else {
      return (
        <svg
          xmlns='http://www.w3.org/2000/svg'
          fill='none'
          viewBox='0 0 24 24'
          strokeWidth={1.5}
          stroke='currentColor'
          className='w-5 h-5'>
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            d='M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z'
          />
        </svg>
      );
    }
  };

  return (
    <div
      className='relative'
      ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className='w-9 h-9 flex items-center justify-center rounded-md bg-background hover:bg-muted transition-colors'
        aria-label={`테마 변경 (현재: ${theme})`}>
        <ThemeIcon />
      </button>

      {isOpen && (
        <div className='absolute right-0 mt-2 w-36 bg-background border border-border rounded-md shadow-lg z-10'>
          <ul className='py-1'>
            <li>
              <button
                onClick={() => {
                  setTheme('light');
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-muted ${theme === 'light' ? 'bg-muted' : ''}`}>
                화이트
              </button>
            </li>
            <li>
              <button
                onClick={() => {
                  setTheme('dark');
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-muted ${theme === 'dark' ? 'bg-muted' : ''}`}>
                다크
              </button>
            </li>
            <li>
              <button
                onClick={() => {
                  setTheme('system');
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-muted ${theme === 'system' ? 'bg-muted' : ''}`}>
                시스템
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
