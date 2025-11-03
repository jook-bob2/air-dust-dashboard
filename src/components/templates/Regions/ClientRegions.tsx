'use client';

import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  SidoSelector,
  AirQualityGrade,
  PollutantValue,
  AirQualityListSkeleton,
  KakaoAirQualityMap,
} from '@/components';
import { SIDO_LIST } from '@/features/air-quality/constants';
import type { SidoAirQualityItem } from '@/features/air-quality/types';
import { fetchAirQualityBySido } from '@/features/air-quality/api';
import { useFavorite } from '@/hooks/useFavorite';

/**
 * @param mode
 * @param onChange
 * @constructor
 */
function ModeToggle({ mode, onChange }: { mode: 'list' | 'map'; onChange: (m: 'list' | 'map') => void }) {
  return (
    <div
      className='inline-flex rounded-md border overflow-hidden'
      role='tablist'
      aria-label='표시 방식 선택'>
      <button
        role='tab'
        aria-selected={mode === 'list'}
        onClick={() => onChange('list')}
        className={`px-3 py-2 text-sm ${mode === 'list' ? 'bg-primary text-primary-foreground' : ''}`}>
        리스트
      </button>
      <button
        role='tab'
        aria-selected={mode === 'map'}
        onClick={() => onChange('map')}
        className={`px-3 py-2 text-sm ${mode === 'map' ? 'bg-primary text-primary-foreground' : ''}`}>
        지도
      </button>
    </div>
  );
}

export default function ClientRegions({ initialSido }: { initialSido?: string }) {
  const [sido, setSido] = useState(initialSido ?? SIDO_LIST[0]);
  const [mode, setMode] = useState<'list' | 'map'>('list');
  const [sigungu, setSigungu] = useState<string | null>(null);
  const { isFavorite, toggle } = useFavorite(sido);
  // 위치 기반 날씨 → 요구사항 변경으로 미사용. 현 미세먼지 정보로 대체 표시.

  // Hydration-safe mount gate to avoid SSR/client mismatch due to time-sensitive external data
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // React Query: 시도 데이터
  const { data, isLoading } = useQuery({
    queryKey: ['airQuality', 'sido', sido],
    queryFn: () => fetchAirQualityBySido(sido),
    staleTime: 10 * 60 * 1000, // 10분
  });

  console.log('data ', data);

  // Memoize items to provide stable reference for useMemo dependencies
  const items = useMemo(() => data?.response?.body?.items ?? [], [data?.response?.body?.items]);

  // 시군구 유사 개념: 측정소 stationName을 이용해 그룹핑/검색
  const groups = useMemo(() => {
    const map = new Map<string, SidoAirQualityItem[]>();
    items.forEach(it => {
      const key = it.stationName; // 간단화: 실제 시군구 데이터가 없으므로 측정소 기준
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(it);
    });
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [items]);

  const filteredGroups = useMemo(() => {
    if (!sigungu) return groups;
    return groups.filter(([name]) => name.includes(sigungu));
  }, [groups, sigungu]);

  // 현재 미세먼지 요약(시도 기준)
  const summary = useMemo(() => {
    if (!items || items.length === 0) return null;
    const nums = (arr: (string | undefined)[]) => arr.map(v => Number(v)).filter(v => !Number.isNaN(v));
    const avg = (arr: number[]) => (arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : NaN);
    const toGradeNum = (g: string | null) => {
      const n = parseInt(g ?? '', 10);
      return Number.isNaN(n) ? 0 : n;
    };
    const pm25Vals = nums(items.map(i => i.pm25Value));
    const pm10Vals = nums(items.map(i => i.pm10Value));
    const pm25Avg = avg(pm25Vals);
    const pm10Avg = avg(pm10Vals);
    const pm25GradeNum = items.reduce((m, it) => Math.max(m, toGradeNum(it.pm25Grade)), 0);
    const pm10GradeNum = items.reduce((m, it) => Math.max(m, toGradeNum(it.pm10Grade)), 0);
    const pm25Grade = pm25GradeNum === 0 ? '-' : String(pm25GradeNum);
    const pm10Grade = pm10GradeNum === 0 ? '-' : String(pm10GradeNum);
    const dataTime = items[0]?.dataTime ?? '';
    return { pm25Avg, pm10Avg, pm25Grade, pm10Grade, dataTime };
  }, [items]);

  if (!mounted) {
    return (
      <div className='space-y-6'>
        <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
          <div className='flex items-center gap-3'>
            <SidoSelector
              selectedSido={sido}
              onSelect={setSido}
            />
          </div>
        </div>
        <AirQualityListSkeleton />
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
        <div className='flex flex-wrap items-center gap-3'>
          <SidoSelector
            selectedSido={sido}
            onSelect={setSido}
          />
          <input
            aria-label='시군구 또는 측정소 검색'
            className='px-3 py-2 border rounded-md bg-background'
            placeholder='시군구/측정소 검색'
            onChange={e => setSigungu(e.target.value || null)}
          />
          <div className='w-full sm:w-auto'>
            <ModeToggle
              mode={mode}
              onChange={setMode}
            />
          </div>
        </div>
        <div className='flex items-center gap-3'>
          <button
            onClick={() => toggle()}
            className='px-3 py-2 border rounded-md'
            aria-pressed={isFavorite}
            aria-label='즐겨찾기 지역 토글'>
            {isFavorite ? '★ 즐겨찾기' : '☆ 즐겨찾기'}
          </button>
        </div>
      </div>

      {/* 현재 미세먼지 */}
      <div>
        <h2 className='text-lg font-semibold mb-2'>현재 미세먼지</h2>
        {!summary ? (
          <div className='text-sm text-muted-foreground'>정보 없음</div>
        ) : (
          <div className='rounded-lg border bg-card text-card-foreground p-4'>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-2'>
              <PollutantValue
                name='pm25'
                value={Number.isNaN(summary.pm25Avg) ? 'N/A' : String(summary.pm25Avg)}
                grade={summary.pm25Grade}
              />
              <PollutantValue
                name='pm10'
                value={Number.isNaN(summary.pm10Avg) ? 'N/A' : String(summary.pm10Avg)}
                grade={summary.pm10Grade}
              />
            </div>
            <div className='mt-2 text-xs text-muted-foreground'>업데이트: {summary.dataTime || '정보 없음'}</div>
          </div>
        )}
      </div>

      {isLoading && items.length === 0 && <AirQualityListSkeleton />}

      {/* 표시 모드 */}
      {mode === 'map' ? (
        <div className='rounded-lg border p-2'>
          <KakaoAirQualityMap
            items={items ?? []}
            sidoName={sido}
            heightVh={70}
          />
        </div>
      ) : null}

      {/* 리스트 */}
      <div className='grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-4'>
        {filteredGroups.length === 0 && <div className='text-muted-foreground'>표시할 정보가 없습니다 (N/A)</div>}
        {filteredGroups.map(([station, arr]) => {
          const first = arr[0];
          return (
            <div
              key={station}
              className='rounded-lg border bg-card text-card-foreground p-4 space-y-3'
              aria-label={`${station} 상태`}>
              <div className='flex items-center justify-between'>
                <div className='font-semibold'>{station}</div>
                <div className='flex items-center gap-2'>
                  <span className='text-sm text-muted-foreground'>PM2.5</span>
                  <AirQualityGrade
                    grade={first.pm25Grade || '-'}
                    size='sm'
                    showText={false}
                  />
                  <span className='text-sm'>{first.pm25Value || 'N/A'}</span>
                </div>
              </div>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm'>
                <PollutantValue
                  name='pm25'
                  value={first.pm25Value}
                  grade={first.pm25Grade}
                />
                <PollutantValue
                  name='pm10'
                  value={first.pm10Value}
                  grade={first.pm10Grade}
                />
              </div>
              <div className='text-xs text-muted-foreground'>업데이트: {first.dataTime || '정보 없음'}</div>
              <StationInlineDetails item={first} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StationInlineDetails({ item }: { item: SidoAirQualityItem }) {
  const safe = (v?: string | null) => (v && v !== '-' ? v : 'N/A');
  const hasGrade = (g?: string | null) => !!g && g !== '-';

  return (
    <div className='mt-2 border-t pt-3'>
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs'>
        {/* 통합지수 */}
        <div className='flex items-center justify-between rounded-md border px-2 py-1'>
          <span className='text-muted-foreground'>통합지수</span>
          <div className='flex items-center gap-2'>
            {hasGrade(item.khaiGrade) && (
              <AirQualityGrade
                grade={item.khaiGrade || '-'}
                size='sm'
              />
            )}
            <span className='font-medium'>{safe(item.khaiValue)}</span>
          </div>
        </div>

        {/* 24시간 평균 */}
        <div className='flex items-center justify-between rounded-md border px-2 py-1'>
          <span className='text-muted-foreground'>24h 평균</span>
          <div className='flex items-center gap-3'>
            <span>
              <span className='mr-1 text-muted-foreground'>PM2.5</span>
              <span className='font-medium'>{safe(item.pm25Value24)}</span>
            </span>
            <span>
              <span className='mr-1 text-muted-foreground'>PM10</span>
              <span className='font-medium'>{safe(item.pm10Value24)}</span>
            </span>
          </div>
        </div>

        {/* O3 */}
        <div className='flex items-center justify-between rounded-md border px-2 py-1'>
          <span className='text-muted-foreground'>O₃</span>
          <div className='flex items-center gap-2'>
            {hasGrade(item.o3Grade) && (
              <AirQualityGrade
                grade={item.o3Grade || '-'}
                size='sm'
                showText={false}
              />
            )}
            <span className='font-medium'>{safe(item.o3Value)}</span>
          </div>
        </div>

        {/* NO2 */}
        <div className='flex items-center justify-between rounded-md border px-2 py-1'>
          <span className='text-muted-foreground'>NO₂</span>
          <div className='flex items-center gap-2'>
            {hasGrade(item.no2Grade) && (
              <AirQualityGrade
                grade={item.no2Grade || '-'}
                size='sm'
                showText={false}
              />
            )}
            <span className='font-medium'>{safe(item.no2Value)}</span>
          </div>
        </div>

        {/* SO2 */}
        <div className='flex items-center justify-between rounded-md border px-2 py-1'>
          <span className='text-muted-foreground'>SO₂</span>
          <div className='flex items-center gap-2'>
            {hasGrade(item.so2Grade) && (
              <AirQualityGrade
                grade={item.so2Grade || '-'}
                size='sm'
                showText={false}
              />
            )}
            <span className='font-medium'>{safe(item.so2Value)}</span>
          </div>
        </div>

        {/* CO */}
        <div className='flex items-center justify-between rounded-md border px-2 py-1'>
          <span className='text-muted-foreground'>CO</span>
          <div className='flex items-center gap-2'>
            {hasGrade(item.coGrade) && (
              <AirQualityGrade
                grade={item.coGrade || '-'}
                size='sm'
                showText={false}
              />
            )}
            <span className='font-medium'>{safe(item.coValue)}</span>
          </div>
        </div>
      </div>

      {/* 부가 정보 */}
      <div
        className='mt-2 flex flex-wrap gap-2 text-xs'
        aria-label='부가 정보'>
        {/* 망 정보 */}
        {item.mangName && (
          <span className='inline-flex items-center gap-1 rounded-full bg-muted text-foreground/80 px-2 py-0.5'>
            <span className='opacity-70'>망</span>
            <span className='font-medium'>{item.mangName}</span>
          </span>
        )}

        {/* 데이터 상태 플래그 (의미 있는 값만) */}
        {item.pm25Flag && item.pm25Flag !== '-' && (
          <span
            className='inline-flex items-center gap-1 rounded-full border border-amber-400/40 bg-amber-50 text-amber-700 dark:bg-amber-900/20 px-2 py-0.5'
            title={`PM2.5 상태: ${item.pm25Flag}`}>
            ⚠️ <span className='font-medium'>PM2.5</span>
            <span className='opacity-80'>{item.pm25Flag}</span>
          </span>
        )}
        {item.pm10Flag && item.pm10Flag !== '-' && (
          <span
            className='inline-flex items-center gap-1 rounded-full border border-amber-400/40 bg-amber-50 text-amber-700 dark:bg-amber-900/20 px-2 py-0.5'
            title={`PM10 상태: ${item.pm10Flag}`}>
            ⚠️ <span className='font-medium'>PM10</span>
            <span className='opacity-80'>{item.pm10Flag}</span>
          </span>
        )}
        {item.no2Flag && item.no2Flag !== '-' && (
          <span
            className='inline-flex items-center gap-1 rounded-full border border-amber-400/40 bg-amber-50 text-amber-700 dark:bg-amber-900/20 px-2 py-0.5'
            title={`NO₂ 상태: ${item.no2Flag}`}>
            ⚠️ <span className='font-medium'>NO₂</span>
            <span className='opacity-80'>{item.no2Flag}</span>
          </span>
        )}
        {item.so2Flag && item.so2Flag !== '-' && (
          <span
            className='inline-flex items-center gap-1 rounded-full border border-amber-400/40 bg-amber-50 text-amber-700 dark:bg-amber-900/20 px-2 py-0.5'
            title={`SO₂ 상태: ${item.so2Flag}`}>
            ⚠️ <span className='font-medium'>SO₂</span>
            <span className='opacity-80'>{item.so2Flag}</span>
          </span>
        )}
        {item.coFlag && item.coFlag !== '-' && (
          <span
            className='inline-flex items-center gap-1 rounded-full border border-amber-400/40 bg-amber-50 text-amber-700 dark:bg-amber-900/20 px-2 py-0.5'
            title={`CO 상태: ${item.coFlag}`}>
            ⚠️ <span className='font-medium'>CO</span>
            <span className='opacity-80'>{item.coFlag}</span>
          </span>
        )}
      </div>
    </div>
  );
}
