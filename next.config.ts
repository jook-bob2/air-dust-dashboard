import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Enable SVGR in Turbopack dev as well
  turbopack: {
    rules: {
      '*.svg': {
        loaders: [
          {
            loader: '@svgr/webpack',
            options: {
              svgo: true,
              svgoConfig: {
                plugins: [
                  {
                    name: 'preset-default',
                    params: { overrides: { removeViewBox: false } },
                  },
                ],
              },
            },
          },
        ],
        as: '*.js',
      },
    },
  },
  // Configure SVGR for Webpack builds
  webpack: config => {
    // svg를 컴포넌트로 사용
    config.module.rules.push({
      test: /\.svg$/i,
      oneOf: [
        // 1) `?url` 쿼리로 불러오면 파일 URL로
        { resourceQuery: /url/, type: 'asset/resource' },

        // 2) JS/TS에서 import하면 SVGR로 React 컴포넌트 변환
        {
          issuer: /\.[jt]sx?$/,
          use: [
            {
              loader: '@svgr/webpack',
              options: {
                svgo: true,
                svgoConfig: {
                  plugins: [
                    {
                      name: 'preset-default',
                      params: { overrides: { removeViewBox: false } },
                    },
                    // 다수 인라인 사용 시 ID 충돌 방지 원하면 주석 해제
                    // { name: 'prefixIds' },
                  ],
                },
                // icon: true, // width/height 제거 + currentColor 사용 시
              },
            },
          ],
        },

        // 3) 그 외(import 경로가 CSS 등) → 파일 URL
        { type: 'asset/resource' },
      ],
    });

    return config;
  },
};

export default nextConfig;
