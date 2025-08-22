export type AirQualityItem = {
  stationName: string;
  dataTime: string;
  pm10Value: string;
  pm25Value: string;
  [key: string]: string; // 다른 값들 (so2Value, o3Value 등) 포함 가능
};

export type AirQualityResponse = {
  response: {
    header: {
      resultCode: string;
      resultMsg: string;
    };
    body: {
      items: AirQualityItem[];
      totalCount: number;
      pageNo: number;
      numOfRows: number;
    };
  };
};
