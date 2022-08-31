export type TimeRangeValue = '15_MINS' | '1_HRS' | '24_HRS' | '7_DAYS' | '30_DAYS';

export interface TimeRange {
  label: string;
  value: TimeRangeValue;
}

export interface ApiDataPoint {
  label: string;
  value: number;
}

export interface EndpointMetric {
  errorCount: number;
  invalidCount?: number;
  endpointMethod: string;
  successCount: number;
  totalCount?: number;
}

export interface ApiStatsData {
  requestLatencyMs: number;
  requestSuccessRatePercentage: number;
  totalInvalidRequests: number;
  totalRequestVolume: number;
  requestStatusPerMethod: ApikeyEndpointMetricsPerBaseWindow[];

  charts: {
    totalRequestVolume: ApikeyMetricsPerBaseWindow[];
    totalRequestsPerMethod: EndpointMetric[];
    totalRequestsPerStatus: ApiDataPoint[];
  };
}

export interface Net {
  MAINNET: 'MAINNET';
  TESTNET: 'TESTNET';
}

export interface ApikeyMetricsPerBaseWindow {
  successCount: number;
  errorCount: number;
  network: Net;
  minLatency: number;
  maxLatency: number;
  meanLatency: number;
  windowStart: Date;
  windowEnd: Date;
}
export interface ApikeyEndpointMetricsPerBaseWindow {
  successCount: number;
  errorCount: number;
  network: Net;
  minLatency: number;
  maxLatency: number;
  meanLatency: number;
  windowStart: Date;
  windowEnd: Date;
  endpointGroup: string;
  endpointMethod: string;
}
export interface ApikeyGeographyMetricsPerBaseWindow {
  successCount: number;
  errorCount: number;
  network: Net;
  minLatency: number;
  maxLatency: number;
  meanLatency: number;
  windowStart: Date;
  windowEnd: Date;
  country: string;
  state: string;
}
export type Metric =
  | ApikeyMetricsPerBaseWindow
  | ApikeyEndpointMetricsPerBaseWindow
  | ApikeyGeographyMetricsPerBaseWindow;
export interface RpcStatsPagingResponse {
  count: number;
  page: Array<any>;
}
