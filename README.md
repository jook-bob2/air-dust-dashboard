# 미세먼지 알리미 (Air Dust Dashboard)

전국 시도/시군구(측정소 기준) 실시간 미세먼지(PM10, PM2.5) 정보를 제공하는 대시보드/지도 서비스입니다. 
Next.js App Router와 Tailwind CSS, TanStack Query, Kakao 지도 SDK를 활용해 접근성, 반응형, SEO를 고려하여 구현되었습니다.

- 배포 타깃: Next.js (App Router)
- 다크/라이트 모드: 지원 (ThemeProvider + CSS 변수)
- 데이터 출처: 에어코리아/환경부 공공데이터 API
- 지도: react-kakao-maps-sdk 기반 마커/클러스터/팝업 제공


## 주요 기능
- 대시보드
  - 시도별 실시간 대기질 요약 및 상세(측정소 단위) 리스트
  - 대기질 예보통보, 초미세먼지 주간예보 섹션
  - 통합대기환경지수 나쁨 이상(경고) 측정소 목록
- 지역별 현황 페이지 (`/regions`)
  - 단계적 지역 선택(전국 → 시도 → 시군구 유사: 측정소명 기반)
  - 리스트/지도 모드 전환
  - 현재 미세먼지 요약(시도 단위 평균/최대 등급)
  - 즐겨찾기 지역(로컬 스토리지)
  - 지도: 등급에 따른 컬러 마커, 클릭 시 팝업(등급/수치/시간), 마커 클러스터, 범례/자료 출처 제공
  - 지역 변경 시 지도 중심 자동 이동(해당 지역 마커들의 중심)
- 접근성/반응형
  - 키보드 네비게이션, 명확한 대비, 스크린리더 친화적 레이블/ARIA 속성
  - 모바일/PC 반응형 레이아웃
- 예외/안정성
  - API가 XML/HTML 등 비정상 응답을 반환할 경우 안전 파싱(safeParseJson) 및 경고 로그 처리
  - 서버 컴포넌트 fetch 오류 시 클라이언트 위임 렌더
  - 지도 로딩 실패/권한 거부 시 가이드 메시지 및 기본 중심(Fallback)


## 스크린샷 (예시)
- public/logo.svg, public/globe.svg 등을 로고/아이콘으로 사용합니다. 실제 화면은 로컬 실행 후 확인하세요.


## 빠른 시작
프로젝트 루트에서 다음 명령을 실행하세요. 패키지 매니저는 pnpm 기준으로 안내합니다.

```bash
pnpm i
pnpm dev
```

- 개발 서버: http://localhost:3000
- 터보팩 활성화: package.json의 `dev` 스크립트에서 `next dev --turbopack` 사용

빌드/실행:
```bash
pnpm build
pnpm start
```

코드 품질 검사:
```bash
pnpm lint
```


## 환경 변수 설정 (.env.local)
다음 키들을 설정해야 정상 동작합니다. 루트에 `.env.local` 파일을 생성하세요.

```env
# 에어코리아/환경부 공공데이터 API 엔드포인트 (프록시 또는 직접 URL)
NEXT_PUBLIC_API_BASE="<YOUR_BASE_URL>"
# 에어코리아 API 인증키 (URL 인코딩 필요할 수 있음)
NEXT_PUBLIC_API_KEY="<YOUR_SERVICE_KEY>"

# Kakao 지도 JavaScript 키
NEXT_PUBLIC_KAKAO_JS_KEY="<YOUR_KAKAO_JAVASCRIPT_KEY>"
```

주의 사항:
- Kakao 지도 키가 없으면 지도 영역에 안내 메시지가 노출됩니다.
- 공공데이터 API가 일시적으로 XML/HTML을 반환할 수 있어, 안전 파서가 null을 반환하고 UI는 N/A 또는 안내 문구를 표시합니다.


## 기술 스택
- Framework: Next.js 15 (App Router)
- Language: TypeScript / React 19
- Styling: Tailwind CSS
- State/Data: TanStack Query (React Query)
- Map: react-kakao-maps-sdk
- Lint/Format: ESLint, Prettier


## 아키텍처/구조 요약
- App Router 기반 페이지
  - `/` 대시보드 (서버 컴포넌트에서 fetch 시도 → 실패 시 클라이언트 위임)
  - `/regions` 지역별 현황 (RSC 선로딩 + 클라이언트 상호작용)
  - `not-found.tsx` 사용자 친화 404 페이지 (MainLayout 포함)
- 레이아웃/테마
  - `src/app/layout.tsx`: next/font(Noto Sans KR/Mono) + ThemeProvider, 다크모드 클래스 주입
  - Tailwind theme tokens: CSS 변수 기반 색상 시스템
- 데이터 접근
  - `src/features/air-quality/api.ts`: ky 기반 API 클라이언트, 안전 파서 `safeParseJson` 사용
  - 오류 시 throw 대신 경고와 안전한 fallback 응답을 반환하여 UX를 보호
  - ISR 유사 동작: `/regions`는 `export const revalidate = 3600` (1시간)로 캐싱
- 지도
  - `react-kakao-maps-sdk` 로더 활용(스크립트 중복 주입 방지)
  - 마커 클러스터/커스텀 오버레이, 범례/자료 출처, 모바일 드래그/줌 대응
  - 지역 변경 시 마커 재지오코딩 및 중심 재계산, 서울 특수 케이스 보정 로직 포함

폴더 개요(일부):
- `src/app` 페이지/레이아웃/글로벌 스타일
- `src/components` atoms/molecules/organisms/templates
- `src/features/air-quality` API/타입/상수
- `src/lib` 유틸(safeParseJson, 다크모드 스크립트 등)


## 사용 방법
- 대시보드
  - 기본 시도(서울) 기준으로 실시간 항목 및 예보 섹션 확인
  - “나쁨” 이상 측정소 목록에서 이슈 지역 빠르게 파악
- 지역별 현황
  - 상단에서 시도 선택 → 리스트/지도 모드로 전환
  - 검색창에 시군구/측정소명 일부를 입력해 필터링
  - 지도 마커 클릭 시 팝업에서 PM10/PM2.5/등급/측정시각 확인, 지도 외부 클릭 또는 닫기 버튼으로 팝업 닫기


## 데이터 정책/주의 사항
- 공공데이터 특성상 “실시간”처럼 보이지만 보통 1시간 단위 갱신입니다.
- 동일 지역 중복 표시는 측정소 기준으로 그룹화하여 최소화합니다.
- 데이터 미수신 시 N/A 또는 “정보 없음”을 표시합니다.
- 외부 API 장애 시 캐싱 데이터 또는 경고 안내를 표시합니다.


## 문제 해결 (Troubleshooting)
- 지도에 마커가 보이지 않음
  - `.env.local`에 `NEXT_PUBLIC_KAKAO_JS_KEY`가 설정되어 있는지 확인하세요.
  - 브라우저 위치 권한을 거부해도 지도는 기본 중심(서울)에서 동작합니다.
- 서울 선택 시 지도 이동/마커 미표시 문제
  - 주소 지오코딩이 실패하는 케이스를 대비해 “서울특별시 {측정소}” 등 보정/키워드 검색을 수행합니다.
  - 최초 1회 이후에도 지역 변경마다 데이터를 재요청/재지오코딩하도록 수정되어 있습니다.
- 개발 환경에서 콘솔 에러 오버레이가 뜸
  - API가 XML/HTML을 반환하면 `safeParseJson`이 경고 로그와 함께 null을 반환합니다. API 계층에서도 throw 대신 경고와 안전 응답을 반환하여 오버레이를 방지합니다.
- 403/쿼터 초과
  - 카카오/공공데이터 API 쿼터 초과 시 지도/데이터가 제한될 수 있습니다. 키/요금제/캐싱 정책을 확인하세요.


## 빌드/배포 가이드
- Vercel/Node 환경 모두 대응합니다.
- 환경 변수는 런타임에 노출되는 `NEXT_PUBLIC_*` 프리픽스를 사용합니다.
- 정적/하이브리드 렌더링: 페이지별 RSC + 클라이언트 컴포넌트 조합, `/regions`는 `revalidate = 3600`으로 캐싱.


## 참고/감사
- 데이터 출처: 에어코리아 / 환경부
- 지도: Kakao Developers
- UI: Tailwind CSS

필요 시 이 README를 유지보수하여 새 기능, 환경 변수, 페이지 구조 변경 사항을 반영하세요.
