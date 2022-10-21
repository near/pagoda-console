import type { Api } from '@pc/common/types/api';
import type { RpcStats } from '@pc/common/types/rpcstats';
import type { DateTime, DateTimeUnit } from 'luxon';
import { useEffect, useState } from 'react';
import useSWR from 'swr';

import { useIdentity } from '@/hooks/user';
import { authenticatedPost } from '@/utils/http';

type Project = Api.Query.Output<'/projects/getDetails'>;
type Environment = Api.Query.Output<'/projects/getEnvironments'>[number];

function timeRangeToDates(timeRangeValue: RpcStats.TimeRangeValue, endTime: DateTime): [DateTime, DateTime] {
  switch (timeRangeValue) {
    case '30_DAYS':
      return [endTime.minus({ days: 30 }), endTime];
    case '7_DAYS':
      return [endTime.minus({ days: 7 }), endTime];
    case '24_HRS':
      return [endTime.minus({ hours: 24 }), endTime];
    case '1_HRS':
      return [endTime.minus({ hours: 1 }), endTime];
    case '15_MINS':
      return [endTime.minus({ minutes: 15 }), endTime];
  }
}

function totalMetrics(endpointMetrics: RpcStats.Metrics[]): {
  successCount: number;
  errorCount: number;
  weightedTotalLatency: number;
} {
  let successCount = 0;
  let errorCount = 0;
  let weightedTotalLatency = 0;
  for (let i = 0; i < endpointMetrics.length; i++) {
    successCount += endpointMetrics[i].successCount;
    errorCount += endpointMetrics[i].errorCount;
    weightedTotalLatency +=
      endpointMetrics[i].meanLatency * (endpointMetrics[i].successCount + endpointMetrics[i].errorCount);
  }
  return { successCount, errorCount, weightedTotalLatency };
}

function endpointTotals(
  endpointMetrics: RpcStats.Metrics[],
): (Pick<RpcStats.Metrics, 'endpointMethod' | 'successCount' | 'errorCount'> & { totalCount: number })[] {
  return endpointMetrics.map((endpointMetric) => {
    return {
      endpointMethod: endpointMetric.endpointMethod,
      successCount: endpointMetric.successCount,
      errorCount: endpointMetric.errorCount,
      totalCount: endpointMetric.successCount + endpointMetric.errorCount,
    };
  });
}

function resolutionForTimeRange(timeRangeValue: RpcStats.TimeRangeValue): RpcStats.DateTimeResolution {
  switch (timeRangeValue) {
    case '30_DAYS':
      return 'ONE_HOUR';
    case '7_DAYS':
      return 'ONE_HOUR';
    case '24_HRS':
      return 'ONE_HOUR';
    case '1_HRS':
      return 'ONE_MINUTE';
    case '15_MINS':
      return 'FIFTEEN_SECONDS';
  }
}

function toLuxonDateTimeResolution(dateTimeResolution: RpcStats.DateTimeResolution) {
  switch (dateTimeResolution) {
    case 'FIFTEEN_SECONDS':
      return 'minutes'; // for boundary calculation, addition is handled separately
    case 'ONE_MINUTE':
      return 'minutes';
    case 'ONE_HOUR':
      return 'hours';
    case 'ONE_DAY':
      return 'days';
  }
}

function fillEmptyDateValues(
  dateValues: RpcStats.Metrics[],
  startDateTime: DateTime,
  endDateTime: DateTime,
  dateTimeResolution: RpcStats.DateTimeResolution,
) {
  const filledDateValues: Omit<RpcStats.Metrics, 'apiKeyIdentifier' | 'endpointMethod' | 'network'>[] = [];
  const luxonDateTimeResolution = toLuxonDateTimeResolution(dateTimeResolution);
  // set currentDateTime to start of next dateTimeResolution
  let currentDateTime = startDateTime
    .plus({ [luxonDateTimeResolution]: 1 })
    .startOf(<DateTimeUnit>luxonDateTimeResolution.slice(0, -1));
  while (currentDateTime <= endDateTime) {
    const dateValue = dateValues.find((dateValue) => dateValue.windowStart === currentDateTime.toUTC().toISO());
    if (dateValue) {
      filledDateValues.push(dateValue);
    } else {
      filledDateValues.push({
        windowStart: currentDateTime.toUTC().toISO(),
        successCount: 0,
        errorCount: 0,
        minLatency: 0,
        maxLatency: 0,
        meanLatency: 0,
      });
    }
    currentDateTime =
      dateTimeResolution === 'FIFTEEN_SECONDS'
        ? currentDateTime.plus({ ['seconds']: 15 })
        : currentDateTime.plus({ [luxonDateTimeResolution]: 1 });
  }
  return filledDateValues;
}

type EndpointMetrics = Api.Query.Output<'/rpcstats/endpointMetrics'>;

export function useApiStats(
  environment: Environment | undefined,
  project: Project | undefined,
  timeRangeValue: RpcStats.TimeRangeValue,
  rangeEndTime: DateTime,
) {
  const { identity } = useIdentity();
  const [startDateTime, endDateTime] = timeRangeToDates(timeRangeValue, rangeEndTime); // convert timeRangeValue to params for use in the API call
  const dateTimeResolution = resolutionForTimeRange(timeRangeValue);
  const [dataByDate, setDataByDate] = useState<EndpointMetrics>();
  const [dataByEndpoint, setDataByEndpoint] = useState<EndpointMetrics>();

  const { data: dataByDateResponse } = useSWR(
    identity && environment && project && startDateTime && endDateTime
      ? [
          '/rpcstats/endpointMetrics' as const,
          'date',
          environment.subId,
          identity.uid,
          startDateTime.toISO(),
          endDateTime.toISO(),
        ]
      : null,
    (key) => {
      return authenticatedPost(key, {
        environmentSubId: environment!.subId,
        projectSlug: project!.slug,
        startDateTime: startDateTime.toString(),
        endDateTime: endDateTime.toString(),
        filter: {
          type: 'date',
          dateTimeResolution,
        },
      });
    },
  );

  const { data: dataByEndpointResponse } = useSWR(
    identity && environment && project && startDateTime && endDateTime
      ? [
          '/rpcstats/endpointMetrics' as const,
          'endpoint',
          environment.subId,
          identity.uid,
          startDateTime.toISO(),
          endDateTime.toISO(),
        ]
      : null,
    (key) => {
      return authenticatedPost(key, {
        environmentSubId: environment!.subId,
        projectSlug: project!.slug,
        startDateTime: startDateTime.toString(),
        endDateTime: endDateTime.toString(),
        filter: { type: 'endpoint' },
      });
    },
  );

  useEffect(() => {
    if (dataByDateResponse) setDataByDate(dataByDateResponse);
    if (dataByEndpointResponse) setDataByEndpoint(dataByEndpointResponse);
  }, [dataByDateResponse, dataByEndpointResponse]);

  if (!dataByDate || !dataByEndpoint) {
    return undefined;
  }

  const { successCount, errorCount, weightedTotalLatency } =
    dataByDate && dataByDate.page
      ? totalMetrics(dataByDate.page)
      : {
          successCount: 0,
          errorCount: 0,
          weightedTotalLatency: 0,
        };
  const successRate = successCount / (successCount + errorCount);

  const chartData = {
    requestLatencyMs: Math.round(weightedTotalLatency / (successCount + errorCount)),
    requestSuccessRatePercentage: Math.round(successRate * 100000) / 1000, // i.e. 99.999
    totalInvalidRequests: errorCount,
    totalRequestVolume: successCount + errorCount,
  };

  return {
    ...chartData,
    requestStatusPerMethod: dataByEndpoint?.page ?? [],

    charts: {
      totalRequestsPerStatus: [
        {
          label: 'Success',
          value: successCount,
        },
        // {
        //   label: 'Invalid',
        //   value: 0, // TODO: determine what we want here
        // },
        {
          label: 'Failed',
          value: errorCount,
        },
      ],
      totalRequestsPerMethod: endpointTotals(dataByEndpoint?.page ?? []),
      totalRequestVolume: fillEmptyDateValues(dataByDate?.page || [], startDateTime, endDateTime, dateTimeResolution),
    },
  };
}
