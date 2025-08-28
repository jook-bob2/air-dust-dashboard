import {
  ApiResponse,
  AirQualityForecastItem,
  BadAirQualityStationItem,
  SidoAirQualityItem,
  StationAirQualityItem,
  WeeklyPM25ForecastItem,
} from './types';
import { getJson } from '@/lib/network/request';

const SERVICE_PREFIX = 'ArpltnInforInqireSvc/';

// 유틸
const getFormattedDate = () => new Date().toISOString().split('T')[0].replace(/-/g, '');

const safeParseInt = (value: string | undefined | null): number => {
  const parsed = parseInt(value ?? '');
  return isNaN(parsed) ? 0 : parsed;
};

const createApiResponse = <T>(resultCode: string, resultMsg: string, items: T[]): ApiResponse<T> => ({
  response: {
    header: { resultCode, resultMsg },
    body: {
      totalCount: items.length,
      pageNo: 1,
      numOfRows: items.length,
      items,
    },
  },
});

/* ------------------------- API FUNCTIONS ------------------------- */

// 1. 시도별 실시간 측정정보 조회
export const fetchAirQualityBySido = async (sidoName: string): Promise<ApiResponse<SidoAirQualityItem>> => {
  try {
    const json = await getJson<ApiResponse<SidoAirQualityItem>>(`${SERVICE_PREFIX}getCtprvnRltmMesureDnsty`, {
      searchParams: {
        sidoName,
        numOfRows: '50',
        pageNo: '1',
        ver: '1.3',
      },
      revalidate: 600, // 10분
    });

    if (!json) {
      console.warn('API 응답이 유효한 JSON이 아닙니다 (sido)');
      return createApiResponse('99', '데이터 조회 실패', []);
    }

    if (json.response?.header?.resultCode && json.response.header.resultCode !== '00') {
      console.warn(`시도별 대기질 API 오류(${sidoName}): [${json.response.header.resultCode}] ${json.response.header.resultMsg}`);
      return createApiResponse('99', '데이터 조회 실패', []);
    }

    return json;
  } catch (error) {
    console.warn(`${sidoName} 지역 대기질 조회 실패:`, error);
    return createApiResponse('99', '데이터 조회 실패', []);
  }
};

// 2. 대기질 예보 통보 조회
export const fetchAirQualityForecast = async (): Promise<ApiResponse<AirQualityForecastItem>> => {
  try {
    const json = await getJson<ApiResponse<AirQualityForecastItem>>(`${SERVICE_PREFIX}getMinuDustFrcstDspth`, {
      searchParams: {
        numOfRows: '10',
        pageNo: '1',
        searchDate: getFormattedDate(),
        ver: '1.1',
      },
      revalidate: 1800, // 30분
    });

    if (!json) {
      console.warn('API 응답이 유효한 JSON이 아닙니다 (forecast)');
      return createApiResponse('99', '데이터 조회 실패', []);
    }

    if (json.response?.header?.resultCode && json.response.header.resultCode !== '00') {
      console.warn(`대기질 예보 API 오류: [${json.response.header.resultCode}] ${json.response.header.resultMsg}`);
      return createApiResponse('99', '데이터 조회 실패', []);
    }

    return json;
  } catch (error) {
    console.warn('대기질 예보 조회 실패:', error);
    return createApiResponse('99', '데이터 조회 실패', []);
  }
};

// 3. 초미세먼지 주간예보
export const fetchWeeklyPM25Forecast = async (): Promise<ApiResponse<WeeklyPM25ForecastItem>> => {
  try {
    const json = await getJson<ApiResponse<WeeklyPM25ForecastItem>>(`${SERVICE_PREFIX}getMinuDustWeekFrcstDspth`, {
      searchParams: {
        numOfRows: '10',
        pageNo: '1',
        searchDate: getFormattedDate(),
      },
      revalidate: 10800, // 3시간
    });

    if (!json) {
      console.warn('API 응답이 유효한 JSON이 아닙니다 (weekly)');
      return createApiResponse('99', '데이터 조회 실패', []);
    }

    if (json.response?.header?.resultCode && json.response.header.resultCode !== '00') {
      console.warn(`주간예보 API 오류: [${json.response.header.resultCode}] ${json.response.header.resultMsg}`);
      return createApiResponse('99', '데이터 조회 실패', []);
    }

    return json;
  } catch (error) {
    console.warn('주간 예보 조회 실패:', error);
    return createApiResponse('99', '데이터 조회 실패', []);
  }
};

// 4. 측정소별 실시간 측정정보 조회
export const fetchAirQualityByStation = async (stationName: string): Promise<ApiResponse<StationAirQualityItem>> => {
  try {
    const json = await getJson<ApiResponse<StationAirQualityItem>>(`${SERVICE_PREFIX}getMsrstnAcctoRltmMesureDnsty`, {
      searchParams: {
        numOfRows: '1',
        pageNo: '1',
        stationName,
        dataTerm: 'DAILY',
        ver: '1.3',
      },
      revalidate: 600, // 10분
    });

    if (!json) {
      console.warn('API 응답이 유효한 JSON이 아닙니다 (station)');
      return createApiResponse('99', '데이터 조회 실패', []);
    }

    if (json.response?.header?.resultCode && json.response.header.resultCode !== '00') {
      console.warn(`측정소별 대기질 API 오류(${stationName}): [${json.response.header.resultCode}] ${json.response.header.resultMsg}`);
      return createApiResponse('99', '데이터 조회 실패', []);
    }

    return json;
  } catch (error) {
    console.warn(`${stationName} 측정소 조회 실패:`, error);
    return createApiResponse('99', '데이터 조회 실패', []);
  }
};

// 5. 통합대기환경지수 나쁨 이상 측정소 목록 조회
export const fetchBadAirQualityStations = async (): Promise<ApiResponse<BadAirQualityStationItem>> => {
  try {
    const regions = ['서울', '부산', '인천', '대구'];

    const results = await Promise.allSettled(regions.map(fetchAirQualityBySido));

    const items = results
      .filter(
        (res): res is PromiseFulfilledResult<ApiResponse<SidoAirQualityItem>> =>
          res.status === 'fulfilled' && res.value?.response?.body?.items?.length > 0,
      )
      .flatMap(r => r.value.response.body.items);

    const badItems = items.filter(item => {
      const khaiGrade = safeParseInt(item.khaiGrade);
      const pm10Grade = safeParseInt(item.pm10Grade);
      const pm25Grade = safeParseInt(item.pm25Grade);
      return khaiGrade >= 3 || pm10Grade >= 3 || pm25Grade >= 3;
    });

    const result: BadAirQualityStationItem[] = badItems.map(item => ({
      stationName: item.stationName,
      addr: `${item.sidoName} ${item.stationName}`,
      khaiValue: item.khaiValue,
      khaiGrade: item.khaiGrade,
      sidoName: item.sidoName,
      dataTime: item.dataTime,
    }));

    return createApiResponse('00', 'OK', result);
  } catch (error) {
    console.warn('나쁨 이상 측정소 조회 실패:', error);
    return createApiResponse('99', 'API Error', []);
  }
};
