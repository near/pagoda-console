import { DateTime } from 'luxon';
import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { Api } from '@pc/common/types/api';
import { Net } from '@pc/database/clients/core';
import { RpcStats } from '@pc/common/types/rpcstats';

@Injectable()
export class RpcStatsService {
  constructor(private prisma: PrismaService) {}

  async endpointMetrics(
    network: Net,
    apiKeyConsumerNames: Array<string>,
    startDateTime: DateTime,
    endDateTime: DateTime,
    filter: Api.Query.Input<'/rpcstats/endpointMetrics'>['filter'],
  ): Promise<Api.Query.Output<'/rpcstats/endpointMetrics'>> {
    const whereClause = this.determineWhereClause(
      network,
      apiKeyConsumerNames,
      startDateTime,
      endDateTime,
    );

    const groupBy: any = [];
    const orderBy: any = [];
    if (filter.type === 'endpoint') {
      groupBy.push('endpointMethod');
      orderBy.push({ endpointMethod: 'asc' });
    } else {
      groupBy.push('year', 'month', 'day');
      orderBy.push({ year: 'asc' }, { month: 'asc' }, { day: 'asc' });
      if (filter.dateTimeResolution === 'ONE_HOUR') {
        groupBy.push('hour24');
        orderBy.push({ hour24: 'asc' });
      } else if (filter.dateTimeResolution === 'ONE_MINUTE') {
        groupBy.push('hour24', 'minute');
        orderBy.push({ hour24: 'asc' }, { minute: 'asc' });
      } else if (filter.dateTimeResolution === 'FIFTEEN_SECONDS') {
        groupBy.push('hour24', 'minute', 'quarterMinute');
        orderBy.push(
          { hour24: 'asc' },
          { minute: 'asc' },
          { quarterMinute: 'asc' },
        );
      }
    }

    const listPromise = this.prisma.apikeyEndpointMetricsPerBaseWindow.groupBy({
      by: groupBy,
      where: whereClause,
      _count: {
        _all: true,
      },
      _sum: {
        successCount: true,
        errorCount: true,
      },
      _min: {
        minLatency: true,
      },
      _max: {
        maxLatency: true,
      },
      _avg: {
        meanLatency: true, // incorrect, needs weighted average
      },
      orderBy,
    });

    const [metrics] = await Promise.all([listPromise]);
    const page = metrics.map((m) =>
      this.toDto(
        m,
        filter.type === 'date' ? filter.dateTimeResolution : undefined,
      ),
    );
    return {
      count: metrics.length, // no paging currently but maintaining the paging interface in case it's needed
      page,
    };
  }

  private dateTimePartsToResolution(
    dateTimeResolution: RpcStats.DateTimeResolution,
    dateTimeParts: {
      year: number;
      month: number;
      day: number;
      hour24?: number;
      minute?: number;
      quarterMinute?: number;
    },
  ) {
    const {
      year,
      month,
      day,
      hour24: hour,
      minute,
      quarterMinute,
    } = dateTimeParts;
    switch (dateTimeResolution) {
      case 'FIFTEEN_SECONDS':
        const secondsInQuarterMinute = quarterMinute! * 15;
        return DateTime.fromObject(
          {
            year,
            month,
            day,
            hour,
            minute,
            second: secondsInQuarterMinute,
          },
          { zone: 'UTC' },
        );
        break;
      case 'ONE_MINUTE':
        return DateTime.fromObject(
          { year, month, day, hour, minute },
          { zone: 'UTC' },
        );
        break;
      case 'ONE_HOUR':
        return DateTime.fromObject({ year, month, day, hour }, { zone: 'UTC' });
        break;
      case 'ONE_DAY':
        return DateTime.fromObject({ year, month, day }, { zone: 'UTC' });
        break;
      default:
        throw new Error('Invalid dateTimeResolution');
    }
  }

  private toDto(
    aggregatedMetricRow,
    dateTimeResolution?: RpcStats.DateTimeResolution,
  ) {
    const { apiKeyIdentifier, endpointMethod, network } = aggregatedMetricRow;

    const dto = {
      apiKeyIdentifier,
      endpointMethod,
      network,
      successCount: aggregatedMetricRow._sum.successCount,
      errorCount: aggregatedMetricRow._sum.errorCount,
      minLatency: aggregatedMetricRow._min.minLatency,
      maxLatency: aggregatedMetricRow._max.maxLatency,
      meanLatency: aggregatedMetricRow._avg.meanLatency,
    };

    if (dateTimeResolution && aggregatedMetricRow.year) {
      const windowStart = this.dateTimePartsToResolution(
        dateTimeResolution,
        aggregatedMetricRow,
      );
      dto['windowStart'] = windowStart;
    }
    return dto;
  }

  private determineWhereClause(
    network: Net,
    apiKeyConsumerNames: Array<string>,
    startDateTime: DateTime,
    endDateTime: DateTime,
  ) {
    const whereCriteria = {
      network,
      apiKeyConsumerName: { in: apiKeyConsumerNames },
      windowStartEpochMs: {
        gt: startDateTime.toMillis(),
      },
      windowEndEpochMs: {
        lte: endDateTime.plus({ seconds: 15 }).toMillis(), // include current bucket that we are midway through
      },
    };
    return whereCriteria;
  }
}
