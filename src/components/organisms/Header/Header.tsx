'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ThemeSwitcher, SearchBar } from '@/components';
import { useState } from 'react';

const navItems = [
  { label: '대시보드', href: '/' },
  { label: '지역별 현황', href: '/regions' },
  { label: '통계', href: '/stats' },
  { label: '정보', href: '/info' },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className='sticky top-0 z-10 bg-background border-b border-border shadow-sm'>
      <div className='container mx-auto px-4 py-3'>
        <div className='flex items-center justify-between'>
          {/* 로고 */}
          <Link
            href='/'
            className='flex items-center space-x-2'>
            <Image
              src='/logo.svg'
              alt='Logo'
              width={40}
              height={40}
            />
            <span className='text-xl font-bold text-primary'>미세먼지 알리미</span>
          </Link>

          {/* 데스크톱 네비게이션 */}
          <nav className='hidden md:flex items-center space-x-6'>
            {navItems.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className='font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors'>
                {item.label}
              </Link>
            ))}
          </nav>

          {/* 오른쪽 영역: 검색 및 테마 */}
          <div className='flex items-center space-x-4'>
            <div className='hidden md:block w-64'>
              <SearchBar />
            </div>
            <ThemeSwitcher />

            {/* 모바일 메뉴 버튼 */}
            <button
              className='md:hidden p-2 rounded-md hover:bg-muted transition-colors'
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label='메뉴'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                fill='none'
                viewBox='0 0 24 24'
                strokeWidth={1.5}
                stroke='currentColor'
                className='w-6 h-6'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  d='M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5'
                />
              </svg>
            </button>
          </div>
        </div>

        {/* 모바일 메뉴 */}
        {mobileMenuOpen && (
          <div className='md:hidden mt-4 py-2 border-t border-border'>
            <nav className='flex flex-col space-y-4 mt-2'>
              {navItems.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  className='px-2 py-1 hover:bg-muted rounded transition-colors'
                  onClick={() => setMobileMenuOpen(false)}>
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className='mt-4 pt-2 border-t border-border'>
              <SearchBar />
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
