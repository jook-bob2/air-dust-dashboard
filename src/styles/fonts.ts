import { Noto_Sans_KR, Noto_Sans_Mono } from 'next/font/google';

export const notoSansKR = Noto_Sans_KR({
  variable: '--font-noto-sans',
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  display: 'swap',
  preload: true,
});

export const notoSansMono = Noto_Sans_Mono({
  variable: '--font-noto-mono',
  subsets: ['latin'],
  weight: ['400', '700'],
  display: 'swap',
});
