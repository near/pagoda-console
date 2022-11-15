import { Net } from '@pc/database/clients/core';

export enum DateTimeResolution {
  FIFTEEN_SECONDS = 'FIFTEEN_SECONDS',
  ONE_MINUTE = 'ONE_MINUTE',
  ONE_HOUR = 'ONE_HOUR',
  ONE_DAY = 'ONE_DAY',
}

export type TimeRangeValue =
  | '15_MINS'
  | '1_HRS'
  | '24_HRS'
  | '7_DAYS'
  | '30_DAYS';

export enum MetricGroupBy {
  DATE = 'date',
  ENDPOINT = 'endpoint',
}

export type BaseEndpointMetric = {
  endpointMethod: string;
  successCount: number;
  errorCount: number;
  totalCount: number;
};

export type Metrics = {
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
};

export type MetricsPage = {
  count: number;
  page: Metrics[];
};

export namespace Query {
  export namespace Inputs {
    export type EndpointMetrics = {
      projectSlug: string;
      environmentSubId: number;
      startDateTime: string;
      endDateTime: string;
      skip?: number;
      take?: number;
      pagingDateTime?: Date;
      filter:
        | {
            type: MetricGroupBy.DATE;
            dateTimeResolution: DateTimeResolution;
          }
        | {
            type: MetricGroupBy.ENDPOINT;
          };
    };
  }

  export namespace Outputs {
    export type EndpointMetrics = MetricsPage;
  }

  export namespace Errors {
    export type EndpointMetrics = unknown;
  }
}
