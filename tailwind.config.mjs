/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      screens: {
        // 1) 핵심: 모바일 퍼스트 min-width 세트 (대부분의 레이아웃 전환)
        xs: '360px', // 소형 안드로이드, iPhone SE
        xsm: '480px', // iPhone Pro, Galaxy S 시리즈 기준
        sm: '640px', // 태블릿 세로/대형 폰
        md: '768px', // 태블릿 가로 / 작은 노트북
        lg: '1024px', // 일반 노트북
        xl: '1280px', // 데스크탑 시작
        '2xl': '1536px', // 큰 데스크탑
        '3xl': '1920px', // FHD/대형 모니터

        // 2) 보조: max-width 별칭 (딱 “이 이하”일 때 스타일 주기)
        'xs-max': { max: '359px' },
        'xsm-max': { max: '479px' }, // 추가
        'sm-max': { max: '639px' },
        'md-max': { max: '767px' },
        'lg-max': { max: '1023px' },
        'xl-max': { max: '1279px' },
        '2xl-max': { max: '1535px' },

        // 3) 보조: “구간 한정(range)” 별칭 (딱 해당 구간에만 적용)
        'xs-only': { min: '360px', max: '479px' }, // 360~479px
        'xsm-only': { min: '480px', max: '639px' }, // 480~639px
        'sm-only': { min: '640px', max: '767px' },
        'md-only': { min: '768px', max: '1023px' },
        'lg-only': { min: '1024px', max: '1279px' },
        'xl-only': { min: '1280px', max: '1535px' },

        // 4) 특수 조건(선택): 방향/포인터/레티나 등
        landscape: { raw: '(orientation: landscape)' },
        portrait: { raw: '(orientation: portrait)' },
        hoverable: { raw: '(hover: hover)' }, // 마우스/트랙패드 환경
        coarse: { raw: '(pointer: coarse)' }, // 터치 우선 환경
        retina: {
          raw: '(-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi)',
        },
      },
      fontFamily: {
        sans: ['var(--font-noto-sans)'],
        mono: ['var(--font-noto-mono)'],
      },
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [],
};

export default config;
