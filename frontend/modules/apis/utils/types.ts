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
  requestStatusPerMethod: EndpointMetricsDetailsResponseDto[];

  charts: {
    totalRequestVolume: Omit<EndpointMetricsDetailsResponseDto, 'apiKeyIdentifier' | 'endpointMethod' | 'network'>[];
    totalRequestsPerMethod: EndpointMetric[];
    totalRequestsPerStatus: ApiDataPoint[];
  };
}

export interface Net {
  MAINNET: 'MAINNET';
  TESTNET: 'TESTNET';
}

export interface EndpointMetricsDetailsResponseDto {
  apiKeyIdentifier: string;
  endpointGroup?: string;
  endpointMethod: string;
  network: Net;
  windowStart?: string;
  windowEnd?: string;
  successCount: number;
  errorCount: number;
  minLatency: number;
  maxLatency: number;
  meanLatency: number;
}

export interface RpcStatsPagingResponse {
  count: number;
  page: Array<EndpointMetricsDetailsResponseDto>;
}
