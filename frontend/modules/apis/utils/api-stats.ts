import type { RpcStats } from '@pc/common/types/rpcstats';
import type { DateTime, DateTimeUnit } from 'luxon';

export function timeRangeToDates(timeRangeValue: RpcStats.TimeRangeValue, endTime: DateTime): [DateTime, DateTime] {
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

export function resolutionForTimeRange(timeRangeValue: RpcStats.TimeRangeValue): RpcStats.DateTimeResolution {
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

export function fillEmptyDateValues(
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
