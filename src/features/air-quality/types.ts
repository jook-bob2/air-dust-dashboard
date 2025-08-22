// 대기질 관련 데이터 타입 정의

// 공통 응답 타입
export interface ApiResponse<T> {
  response: {
    header: {
      resultCode: string;
      resultMsg: string;
    };
    body: {
      totalCount: number;
      pageNo: number;
      numOfRows: number;
      items: T[];
    };
  };
}

// 시도별 실시간 측정정보 타입
export interface SidoAirQualityItem {
  sidoName: string;
  stationName: string;
  dataTime: string;
  so2Value: string;
  coValue: string;
  o3Value: string;
  no2Value: string;
  pm10Value: string;
  pm25Value: string;
  khaiValue: string;
  khaiGrade: string;
  so2Grade: string;
  coGrade: string;
  o3Grade: string;
  no2Grade: string;
  pm10Grade: string;
  pm25Grade: string;
}

// 대기질 예보통보 조회 타입
export interface AirQualityForecastItem {
  dataTime: string;
  informCode: string;
  informOverall: string;
  informCause: string;
  informGrade: string;
  actionKnack: string;
}

// 초미세먼지 주간예보 조회 타입
export interface WeeklyPM25ForecastItem {
  informCode: string;
  informData: string;
  informGrade: string;
  informCause: string;
  dataTime: string;
  imageUrl1: string;
  imageUrl2: string;
  imageUrl3: string;
}

// 측정소별 실시간 측정정보 타입
export interface StationAirQualityItem {
  stationName: string;
  dataTime: string;
  so2Value: string;
  coValue: string;
  o3Value: string;
  no2Value: string;
  pm10Value: string;
  pm25Value: string;
  khaiValue: string;
  khaiGrade: string;
  so2Grade: string;
  coGrade: string;
  o3Grade: string;
  no2Grade: string;
  pm10Grade: string;
  pm25Grade: string;
}

// 통합대기환경지수 나쁨 이상 측정소 목록 타입
export interface BadAirQualityStationItem {
  stationName: string;
  addr: string;
  khaiValue: string;
  khaiGrade: string;
  sidoName: string;
  dataTime: string;
}
