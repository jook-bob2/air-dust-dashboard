'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useMemo, useState } from 'react';
import { Map, MarkerClusterer, CustomOverlayMap, useKakaoLoader, MapMarker } from 'react-kakao-maps-sdk';
import type { SidoAirQualityItem } from '@/features/air-quality/types';
import { GRADE_TEXT } from '@/features/air-quality/constants';

declare global {
  interface Window {
    kakao?: any;
  }
}

const SEOUL_CENTER = { lat: 37.5665, lng: 126.978 };

function gradeColor(grade: string | undefined): string {
  switch (grade) {
    case '1':
      return '#3B82F6';
    case '2':
      return '#22C55E';
    case '3':
      return '#F59E0B';
    case '4':
      return '#EF4444';
    default:
      return '#9CA3AF';
  }
}

function svgMarkerDataUrl(grade: string | undefined) {
  const color = gradeColor(grade);
  const label = grade && grade !== '-' ? grade : '';
  const svg = encodeURIComponent(
    `<?xml version='1.0' encoding='UTF-8'?>
     <svg xmlns='http://www.w3.org/2000/svg' width='36' height='36' viewBox='0 0 36 36'>
       <circle cx='18' cy='18' r='14' fill='${color}' />
       <text x='18' y='22' text-anchor='middle' font-size='14' font-family='sans-serif' font-weight='700' fill='#ffffff'>${label}</text>
     </svg>`,
  );
  return `data:image/svg+xml;charset=UTF-8,${svg}`;
}

type Props = {
  items: SidoAirQualityItem[] | null | undefined;
  sidoName?: string;
  heightVh?: number; // default 70
};

export default function KakaoAirQualityMap({ items, sidoName, heightVh = 70 }: Props) {
  // Load Kakao SDK once; prevents duplicate <script> tags automatically
  useKakaoLoader({
    appkey: process.env.NEXT_PUBLIC_KAKAO_JS_KEY || '',
    libraries: ['clusterer', 'services'],
  });

  const [error, setError] = useState<string | null>(null);
  const [center, setCenter] = useState<{ lat: number; lng: number }>(SEOUL_CENTER);
  const [positions, setPositions] = useState<
    Array<{
      lat: number;
      lng: number;
      data: {
        title: string;
        pm10: string;
        pm25: string;
        pm10Grade: string;
        pm25Grade: string;
        dataTime: string;
      };
    }>
  >([]);
  const [popup, setPopup] = useState<{
    lat: number;
    lng: number;
    data: {
      title: string;
      pm10: string;
      pm25: string;
      pm10Grade: string;
      pm25Grade: string;
      dataTime: string;
    };
  } | null>(null);
  const [mapReady, setMapReady] = useState(false);

  const markersData = useMemo(
    () =>
      (items ?? []).map(it => ({
        title: `${it.sidoName} ${it.stationName}`,
        addr: `${it.sidoName} ${it.stationName}`,
        sido: it.sidoName,
        station: it.stationName,
        pm10: it.pm10Value,
        pm25: it.pm25Value,
        pm10Grade: it.pm10Grade || '-',
        pm25Grade: it.pm25Grade || '-',
        dataTime: it.dataTime,
      })),
    [items],
  );

  // Try to recenter to user location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => setCenter({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {},
        { enableHighAccuracy: true, timeout: 5000 },
      );
    }
  }, []);

  // Geocode addresses to coordinates when items change and map is ready
  useEffect(() => {
    if (!mapReady) return; // wait until Map onCreate
    let aborted = false;
    // 새 데이터 지오코딩 전에 기존 마커를 비워 잔존 표시를 방지
    setPositions([]);
    const doGeocode = () => {
      if (!window.kakao?.maps?.services) return;
      const geocoder = new window.kakao.maps.services.Geocoder();
      const places = new window.kakao.maps.services.Places();
      const resolved: Array<{ lat: number; lng: number; data: any }> = [];

      const pushResult = (r: any, d: any) => {
        resolved.push({
          lat: Number(r.y),
          lng: Number(r.x),
          data: {
            title: d.title,
            pm10: d.pm10,
            pm25: d.pm25,
            pm10Grade: d.pm10Grade,
            pm25Grade: d.pm25Grade,
            dataTime: d.dataTime,
          },
        });
      };

      const geocodeOne = (d: any) =>
        new Promise<void>(resolve => {
          // 1) 기본 주소 시도: "{sido} {station}"
          geocoder.addressSearch(d.addr, (result: any[], status: string) => {
            if (!aborted && status === window.kakao.maps.services.Status.OK && result[0]) {
              pushResult(result[0], d);
              return resolve();
            }

            // 2) 서울 보정: "서울특별시 {station}"
            const isSeoul = typeof d.sido === 'string' && d.sido.includes('서울');
            if (isSeoul) {
              geocoder.addressSearch(`서울특별시 ${d.station}`, (r2: any[], s2: string) => {
                if (!aborted && s2 === window.kakao.maps.services.Status.OK && r2[0]) {
                  pushResult(r2[0], d);
                  return resolve();
                }
                // 3) 측정소 접미사 보정: "{sido} {station} 측정소"
                geocoder.addressSearch(`${d.sido} ${d.station} 측정소`, (r3: any[], s3: string) => {
                  if (!aborted && s3 === window.kakao.maps.services.Status.OK && r3[0]) {
                    pushResult(r3[0], d);
                    return resolve();
                  }
                  // 4) Places 키워드 검색 (가장 유사한 장소 사용)
                  places.keywordSearch(`${d.sido} ${d.station} 측정소`, (r4: any[], s4: string) => {
                    if (!aborted && s4 === window.kakao.maps.services.Status.OK && r4[0]) {
                      pushResult(r4[0], d);
                      return resolve();
                    }
                    // 5) 마지막 시도: station 단독 키워드
                    places.keywordSearch(`${d.station}`, (r5: any[], s5: string) => {
                      if (!aborted && s5 === window.kakao.maps.services.Status.OK && r5[0]) {
                        pushResult(r5[0], d);
                      }
                      return resolve();
                    });
                  });
                });
              });
              return;
            }

            // 비서울: 측정소 접미사 보정 후 키워드 검색 대체
            geocoder.addressSearch(`${d.sido} ${d.station} 측정소`, (r3: any[], s3: string) => {
              if (!aborted && s3 === window.kakao.maps.services.Status.OK && r3[0]) {
                pushResult(r3[0], d);
                return resolve();
              }
              places.keywordSearch(`${d.sido} ${d.station} 측정소`, (r4: any[], s4: string) => {
                if (!aborted && s4 === window.kakao.maps.services.Status.OK && r4[0]) {
                  pushResult(r4[0], d);
                }
                return resolve();
              });
            });
          });
        });

      Promise.all(markersData.map(geocodeOne))
        .then(() => {
          if (!aborted) setPositions(resolved);
        })
        .catch(e => {
          if (!aborted) setError(e?.message || '지오코딩 중 오류가 발생했습니다.');
        });
    };

    if (window.kakao?.maps?.load) {
      window.kakao.maps.load(() => doGeocode());
    } else {
      doGeocode();
    }

    return () => {
      aborted = true;
    };
  }, [markersData, mapReady]);

  // Recenter map to the centroid of current positions when they are ready (e.g., after switching regions)
  useEffect(() => {
    if (!mapReady) return;
    if (!positions || positions.length === 0) return;
    const avgLat = positions.reduce((sum, p) => sum + p.lat, 0) / positions.length;
    const avgLng = positions.reduce((sum, p) => sum + p.lng, 0) / positions.length;
    setCenter({ lat: avgLat, lng: avgLng });
  }, [positions, mapReady]);

  // Fallback recenter: if no positions resolved (e.g., geocoding failed for Seoul),
  // and the selected region is 서울, center to a safe default (서울시청 부근)
  useEffect(() => {
    if (!mapReady) return;
    if (!positions || positions.length > 0) return;
    if (sidoName && sidoName.includes('서울')) {
      setCenter(SEOUL_CENTER);
    }
  }, [positions, mapReady, sidoName]);

  const legend = (
    <div className='bg-card text-card-foreground border rounded-md shadow px-3 py-2 text-xs flex flex-wrap gap-3'>
      <span className='flex items-center gap-1'>
        <span
          className='inline-block h-3 w-3 rounded-full'
          style={{ background: '#3B82F6' }}></span>
        좋음 (0~30)
      </span>
      <span className='flex items-center gap-1'>
        <span
          className='inline-block h-3 w-3 rounded-full'
          style={{ background: '#22C55E' }}></span>
        보통 (31~80)
      </span>
      <span className='flex items-center gap-1'>
        <span
          className='inline-block h-3 w-3 rounded-full'
          style={{ background: '#F59E0B' }}></span>
        나쁨 (81~150)
      </span>
      <span className='flex items-center gap-1'>
        <span
          className='inline-block h-3 w-3 rounded-full'
          style={{ background: '#EF4444' }}></span>
        매우나쁨 (151+)
      </span>
    </div>
  );

  return (
    <div className='w-full'>
      <div
        className='relative w-full'
        style={{ height: `${heightVh}vh` }}>
        <Map
          center={center}
          level={8}
          style={{ width: '100%', height: '100%' }}
          onCreate={() => setMapReady(true)}
          onClick={() => setPopup(null)}
        >
          <MarkerClusterer
            averageCenter
            minLevel={7}
            gridSize={80}>
            {positions.map(({ lat, lng, data }, idx) => {
              const badge =
                data.pm25Grade && data.pm25Grade !== '-'
                  ? data.pm25Grade
                  : data.pm10Grade && data.pm10Grade !== '-'
                    ? data.pm10Grade
                    : '-';
              return (
                <MapMarker
                  key={`${lat}-${lng}-${idx}`}
                  position={{ lat, lng }}
                  image={{
                    src: svgMarkerDataUrl(badge),
                    size: { width: 36, height: 36 },
                  }}
                  clickable
                  onClick={() => setPopup({ lat, lng, data })}
                />
              );
            })}
          </MarkerClusterer>

          {popup && (
            <CustomOverlayMap
              position={{ lat: popup.lat, lng: popup.lng }}
              yAnchor={1.2}>
              {/* Popup container: stop propagation so map onClick won't fire when clicking inside */}
              <div
                className='relative rounded-xl border bg-white text-black shadow-xl text-sm min-w-[240px] max-w-[340px] sm:max-w-[380px] break-words whitespace-normal leading-snug'
                onClick={e => e.stopPropagation()}
                style={{ overflow: 'hidden' }}
              >
                {/* Header with grade color */}
                {(() => {
                  const dominant = (popup.data.pm25Grade && popup.data.pm25Grade !== '-') ? popup.data.pm25Grade : (popup.data.pm10Grade && popup.data.pm10Grade !== '-' ? popup.data.pm10Grade : '-');
                  const headerColor = gradeColor(dominant);
                  return (
                    <div className='flex items-center justify-between px-3 py-2' style={{ background: headerColor }}>
                      <strong className='text-[13px] font-semibold text-white pr-2 truncate'>{popup.data.title}</strong>
                      <button
                        aria-label='팝업 닫기'
                        className='text-white/90 hover:text-white transition-colors text-base leading-none'
                        onClick={(e) => {
                          e.stopPropagation();
                          setPopup(null);
                        }}
                        style={{ background: 'transparent' }}
                        title='닫기'
                      >
                        ×
                      </button>
                    </div>
                  );
                })()}

                {/* Body */}
                <div className='p-3 space-y-2'>
                  <div className='grid grid-cols-2 gap-2 text-[12px] min-w-0'>
                    <div className='min-w-0 break-words'>
                      <span className='inline-flex items-center gap-1 rounded-full px-2 py-1 border text-[11px] bg-white'>
                        <span className='text-muted-foreground'>PM10</span>
                        <strong>{popup.data.pm10 ?? 'N/A'}</strong>
                        <span className='text-muted-foreground'>μg/m³</span>
                      </span>
                    </div>
                    <div className='min-w-0 break-words'>
                      <span className='inline-flex items-center gap-1 rounded-full px-2 py-1 border text-[11px] bg-white'>
                        <span className='text-muted-foreground'>PM2.5</span>
                        <strong>{popup.data.pm25 ?? 'N/A'}</strong>
                        <span className='text-muted-foreground'>μg/m³</span>
                      </span>
                    </div>
                  </div>

                  <div className='flex items-center justify-between text-[12px]'>
                    <div className='min-w-0 break-words'>
                      등급: <strong>{
                        GRADE_TEXT[(popup.data.pm25Grade || popup.data.pm10Grade || '-') as keyof typeof GRADE_TEXT] ?? '정보없음'
                      }</strong>
                    </div>
                    <div className='text-[11px] text-muted-foreground'>
                      {popup.data.dataTime || '-'}
                    </div>
                  </div>
                </div>

                {/* Pointer triangle */}
                <div className='absolute left-1/2 -bottom-2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-white drop-shadow' />
              </div>
            </CustomOverlayMap>
          )}
        </Map>

        {/* Error overlay if missing key or geocoding issues */}
        {(!process.env.NEXT_PUBLIC_KAKAO_JS_KEY || error) && (
          <div className='absolute inset-0 flex items-center justify-center'>
            <div className='rounded-md border bg-card text-card-foreground px-4 py-3 text-sm shadow'>
              {process.env.NEXT_PUBLIC_KAKAO_JS_KEY
                ? '지도를 초기화하는 중 오류가 발생했습니다.'
                : '카카오맵 키(NEXT_PUBLIC_KAKAO_JS_KEY)가 설정되지 않았습니다.'}
              {error && (
                <>
                  <br />
                  <span className='text-xs text-muted-foreground'>{error}</span>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Legend & Source moved below the map to avoid being hidden by map overlays */}
      <div className='mt-3 flex items-end justify-between flex-wrap gap-2'>
        {legend}
        <div className='text-[10px] text-muted-foreground text-right'>※ 자료 출처: 에어코리아 / 환경부</div>
      </div>
    </div>
  );
}
