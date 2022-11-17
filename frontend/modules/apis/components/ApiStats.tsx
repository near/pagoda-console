// import { useApiKeys } from '@/hooks/api-keys';
import type { Api } from '@pc/common/types/api';
import type { RpcStats } from '@pc/common/types/rpcstats';
import { DateTime } from 'luxon';
import { useEffect, useMemo, useState } from 'react';
import * as Charts from 'recharts';

import { Box } from '@/components/lib/Box';
import { Card } from '@/components/lib/Card';
import * as DropdownMenu from '@/components/lib/DropdownMenu';
import { FeatherIcon } from '@/components/lib/FeatherIcon';
import { Flex } from '@/components/lib/Flex';
import { H2, H4 } from '@/components/lib/Heading';
import { Placeholder } from '@/components/lib/Placeholder';
import { Spinner } from '@/components/lib/Spinner';
import { Switch } from '@/components/lib/Switch';
import * as Table from '@/components/lib/Table';
import { Text } from '@/components/lib/Text';
import { Tooltip } from '@/components/lib/Tooltip';
import { useSureProjectContext } from '@/hooks/project-context';
import { useQuery } from '@/hooks/query';
import config from '@/utils/config';
import { formatNumber } from '@/utils/format-number';
import { StableId } from '@/utils/stable-ids';

import { fillEmptyDateValues, resolutionForTimeRange, timeRangeToDates } from '../utils/api-stats';
import { timeRanges } from '../utils/constants';

type ApiStatsData = Api.Query.Output<'/rpcstats/endpointMetrics'>;

export function ApiStats() {
  const { projectSlug, environmentSubId } = useSureProjectContext();
  // const { keys } = useApiKeys(project?.slug);  // for filtering
  const [selectedTimeRangeValue, setSelectedTimeRangeValue] = useState<RpcStats.TimeRangeValue>('30_DAYS');
  const [liveRefreshEnabled, setLiveRefreshEnabled] = useState(true);
  const selectedTimeRange = timeRanges.find((t) => t.value === selectedTimeRangeValue);
  const [rangeEndTime, setRangeEndTime] = useState(DateTime.now());

  // convert timeRangeValue to params for use in the API call
  const [startDateTime, endDateTime] = useMemo(
    () => timeRangeToDates(selectedTimeRangeValue, rangeEndTime),
    [selectedTimeRangeValue, rangeEndTime],
  );
  const dateTimeResolution = resolutionForTimeRange(selectedTimeRangeValue);
  const dateMetricsQuery = useQuery([
    '/rpcstats/endpointMetrics',
    {
      environmentSubId,
      projectSlug,
      startDateTime: startDateTime.toString(),
      endDateTime: endDateTime.toString(),
      filter: { type: 'date', dateTimeResolution },
    },
  ]);
  const endpointMetricsQuery = useQuery([
    '/rpcstats/endpointMetrics',
    {
      environmentSubId,
      projectSlug,
      startDateTime: startDateTime.toString(),
      endDateTime: endDateTime.toString(),
      filter: { type: 'endpoint' },
    },
  ]);
  const liveRefreshTooltipTitle = `Last updated: ${rangeEndTime.toLocaleString(DateTime.TIME_24_WITH_SECONDS)}. ${
    liveRefreshEnabled ? `Click to disable live updates.` : 'Click to enable live updates.'
  }`;

  useEffect(() => {
    const interval = setInterval(() => {
      if (liveRefreshEnabled) {
        setRangeEndTime(DateTime.now());
      }
    }, config.defaultLiveDataRefreshIntervalMs);

    return () => {
      clearInterval(interval);
    };
  }, [liveRefreshEnabled]);

  return (
    <Flex stack gap="l">
      <Box
        css={{
          padding: 'var(--space-m)',
          margin: 'calc(var(--space-m) * -1)',
          position: 'sticky',
          top: 'var(--size-header-height)',
          alignSelf: 'stretch',
          background: 'linear-gradient(var(--color-surface-3) 75%, transparent)',
          zIndex: 100,
        }}
      >
        <Flex gap="l" align="center">
          <H2 css={{ marginRight: 'auto' }}>RPC Statistics</H2>
          <Tooltip align="end" content={liveRefreshTooltipTitle}>
            <span>
              <Switch
                stableId={StableId.API_STATS_LIVE_UPDATES_SWITCH}
                aria-label="Live Updates"
                checked={liveRefreshEnabled}
                onCheckedChange={setLiveRefreshEnabled}
              >
                <FeatherIcon icon="refresh-cw" size="xs" data-on />
                <FeatherIcon icon="pause" size="xs" data-off />
              </Switch>
            </span>
          </Tooltip>

          <DropdownMenu.Root>
            <DropdownMenu.Button stableId={StableId.API_STATS_TIME_RANGE_DROPDOWN} css={{ width: '15rem' }}>
              <FeatherIcon icon="clock" color="primary" />
              {selectedTimeRange?.label}
            </DropdownMenu.Button>

            <DropdownMenu.Content width="trigger">
              <DropdownMenu.RadioGroup
                value={selectedTimeRangeValue}
                onValueChange={(value) => setSelectedTimeRangeValue(value as RpcStats.TimeRangeValue)}
              >
                {timeRanges?.map((range) => {
                  return (
                    <DropdownMenu.RadioItem key={range.value} value={range.value}>
                      {range.label}
                    </DropdownMenu.RadioItem>
                  );
                })}
              </DropdownMenu.RadioGroup>
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        </Flex>
        <Text color="text2">Stats are for all projects in the organization</Text>
      </Box>

      {!dateMetricsQuery.data || !endpointMetricsQuery.data ? (
        <Spinner />
      ) : (
        <Stats
          dateMetrics={dateMetricsQuery.data}
          endpointMetrics={endpointMetricsQuery.data}
          startDateTime={startDateTime}
          endDateTime={endDateTime}
          dateTimeResolution={dateTimeResolution}
        />
      )}
    </Flex>
  );
}

function Stats({
  dateMetrics,
  endpointMetrics,
  startDateTime,
  endDateTime,
  dateTimeResolution,
}: {
  dateMetrics: Api.Query.Output<'/rpcstats/endpointMetrics'>;
  endpointMetrics: Api.Query.Output<'/rpcstats/endpointMetrics'>;
  startDateTime: DateTime;
  endDateTime: DateTime;
  dateTimeResolution: RpcStats.DateTimeResolution;
}) {
  const successCount = useMemo(
    () => dateMetrics.page.reduce((acc, { successCount }) => acc + successCount, 0),
    [dateMetrics.page],
  );
  const errorCount = useMemo(
    () => dateMetrics.page.reduce((acc, { errorCount }) => acc + errorCount, 0),
    [dateMetrics.page],
  );
  const weightedTotalLatency = useMemo(
    () =>
      dateMetrics.page.reduce(
        (acc, { meanLatency, successCount, errorCount }) => acc + meanLatency * (successCount + errorCount),
        0,
      ),
    [dateMetrics.page],
  );
  const successRate = successCount / (successCount + errorCount);
  if (successCount + errorCount === 0) {
    return (
      <Card>
        <Text>No Data for the selected time range.</Text>
      </Card>
    );
  }
  return (
    <>
      <TopLevelStats
        totalRequestVolume={successCount + errorCount}
        requestSuccessRatePercentage={Math.round(successRate * 100000) / 1000}
        totalInvalidRequests={errorCount}
        requestLatencyMs={Math.round(weightedTotalLatency / (successCount + errorCount))}
      />

      <TotalRequestVolumeChart
        stats={dateMetrics.page}
        startDateTime={startDateTime}
        endDateTime={endDateTime}
        dateTimeResolution={dateTimeResolution}
      />

      <Box
        css={{
          display: 'grid',
          width: '100%',
          gap: 'var(--space-l)',
          gridTemplateColumns: 'repeat(auto-fit, minmax(30em, 1fr))',
        }}
      >
        {/* NOTE: Flex layout wasn't behaving with Rechart's <ResponsiveContainer /> component so we're using grid instead. */}
        <MethodBreakdownChart stats={endpointMetrics.page} />
        <RequestStatusChart successCount={successCount} errorCount={errorCount} />
      </Box>

      <RequestsTable stats={endpointMetrics.page} />
    </>
  );
}

function TopLevelStats({
  totalRequestVolume,
  requestSuccessRatePercentage,
  totalInvalidRequests,
  requestLatencyMs,
}: {
  totalRequestVolume: number;
  requestSuccessRatePercentage: number;
  totalInvalidRequests: number;
  requestLatencyMs: number;
}) {
  return (
    <Box
      css={{
        display: 'grid',
        width: '100%',
        gap: 'var(--space-m)',
        gridTemplateColumns: 'repeat(auto-fit, minmax(16em, 1fr))',
      }}
    >
      <Card border>
        <Flex stack gap="s">
          <Text size="bodySmall" family="heading" color="text3">
            Total Request Volume
          </Text>

          <Text size="h4" family="number" color="text1">
            {formatNumber(totalRequestVolume)}
          </Text>
        </Flex>
      </Card>

      <Card border>
        <Flex stack gap="s">
          <Text size="bodySmall" family="heading" color="text3">
            Request Success Rate
          </Text>

          <Text size="h4" family="number" color="text1">
            {requestSuccessRatePercentage}%
          </Text>
        </Flex>
      </Card>

      <Card border>
        <Flex stack gap="s">
          <Text size="bodySmall" family="heading" color="text3">
            Number of Failed Requests
          </Text>

          <Text size="h4" family="number" color="text1">
            {formatNumber(totalInvalidRequests)}
          </Text>
        </Flex>
      </Card>

      <Card border>
        <Flex stack gap="s">
          <Text size="bodySmall" family="heading" color="text3">
            Average Latency
          </Text>

          <Text size="h4" family="number" color="text1">
            {formatNumber(requestLatencyMs)}ms
          </Text>
        </Flex>
      </Card>
    </Box>
  );
}

function TotalRequestVolumeChart({
  stats,
  startDateTime,
  endDateTime,
  dateTimeResolution,
}: {
  stats: ApiStatsData['page'];
  startDateTime: DateTime;
  endDateTime: DateTime;
  dateTimeResolution: RpcStats.DateTimeResolution;
}) {
  const chart = useMemo(
    () => fillEmptyDateValues(stats, startDateTime, endDateTime, dateTimeResolution),
    [stats, startDateTime, endDateTime, dateTimeResolution],
  );
  return (
    <Card>
      <Flex stack gap="l">
        <H4>Total Request Volume</H4>

        {chart !== undefined ? (
          <Charts.ResponsiveContainer width="100%" height={250}>
            <Charts.LineChart data={chart}>
              <Charts.CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-2)" />

              <Charts.XAxis
                dataKey="windowStart"
                stroke="var(--color-text-2)"
                fontFamily="var(--font-heading)"
                fontSize="var(--font-size-body-small)"
                tickFormatter={(value: string) => DateTime.fromISO(value).toLocaleString(DateTime.DATETIME_SHORT)}
              />

              <Charts.YAxis
                dataKey="successCount"
                stroke="var(--color-text-2)"
                fontFamily="var(--font-number)"
                fontSize="var(--font-size-body-small)"
                width={120}
                tickFormatter={(value: number) => formatNumber(value)}
              />

              <Charts.Tooltip
                formatter={(value: number) => [formatNumber(value), 'Requests']}
                labelFormatter={(value: string) => DateTime.fromISO(value).toLocaleString(DateTime.DATETIME_SHORT)}
                labelStyle={{ color: 'var(--color-text-3)' }}
                contentStyle={{
                  background: 'var(--color-surface-overlay',
                  border: 'none',
                  borderRadius: 'var(--border-radius-xs)',
                  boxShadow: 'var(--shadow-soft)',
                }}
                cursor={{ stroke: 'var(--color-text-2)' }}
              />

              <Charts.Line
                isAnimationActive={false}
                type="monotone"
                dataKey="successCount"
                stroke="var(--color-primary)"
                dot={{ fill: 'var(--color-surface-1)' }}
              />
            </Charts.LineChart>
          </Charts.ResponsiveContainer>
        ) : (
          <Placeholder css={{ height: 250 }} />
        )}
      </Flex>
    </Card>
  );
}

function MethodBreakdownChart({ stats }: { stats: ApiStatsData['page'] }) {
  const chart = useMemo(
    () =>
      stats.map((endpointMetric) => ({
        endpointMethod: endpointMetric.endpointMethod,
        successCount: endpointMetric.successCount,
        errorCount: endpointMetric.errorCount,
        totalCount: endpointMetric.successCount + endpointMetric.errorCount,
      })),
    [stats],
  );
  return (
    <Card>
      <Flex stack gap="l">
        <H4>Method Breakdown</H4>

        <Charts.ResponsiveContainer width="100%" height={250}>
          <Charts.BarChart layout="vertical" data={chart}>
            <Charts.CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-2)" />

            <Charts.XAxis
              dataKey="totalCount"
              type="number"
              stroke="var(--color-text-2)"
              fontFamily="var(--font-number)"
              fontSize="var(--font-size-body-small)"
              tickFormatter={(value: number) => formatNumber(value)}
            />

            <Charts.YAxis
              dataKey="endpointMethod"
              type="category"
              width={120}
              stroke="var(--color-text-2)"
              fontFamily="var(--font-heading)"
              fontSize="var(--font-size-body-small)"
            />

            <Charts.Tooltip
              formatter={(value: number) => [formatNumber(value), 'Requests']}
              labelStyle={{ color: 'var(--color-text-3)' }}
              contentStyle={{
                background: 'var(--color-surface-overlay',
                border: 'none',
                borderRadius: 'var(--border-radius-xs)',
                boxShadow: 'var(--shadow-soft)',
              }}
              cursor={{ fill: 'var(--color-surface-1)' }}
            />

            <Charts.Bar
              dataKey="totalCount"
              fill="var(--color-primary)"
              radius={[0, 8, 8, 0]}
              isAnimationActive={false}
            />
          </Charts.BarChart>
        </Charts.ResponsiveContainer>
      </Flex>
    </Card>
  );
}

function RequestStatusChart({ successCount, errorCount }: { successCount: number; errorCount: number }) {
  const colors: Record<string, string> = {
    Success: 'var(--color-success)',
    Failed: 'var(--color-danger)',
    Invalid: 'var(--color-warning)',
  };
  const totalRequestsPerStatus = [
    {
      label: 'Success',
      value: successCount,
    },
    {
      label: 'Failed',
      value: errorCount,
    },
  ];

  return (
    <Card>
      <Flex stack gap="l">
        <H4>Request Status</H4>
        <Charts.ResponsiveContainer width="100%" height={250}>
          <Charts.PieChart>
            <Charts.Pie
              dataKey="value"
              nameKey="label"
              data={totalRequestsPerStatus}
              label={(data) => formatNumber(data.payload.value)}
              fontFamily="var(--font-number)"
              fontSize="var(--font-size-body-small)"
              isAnimationActive={false}
              stroke="var(--color-border-1)"
            >
              {totalRequestsPerStatus.map((entry) => (
                <Charts.Cell fill={colors[entry.label]} key={entry.label} />
              ))}
            </Charts.Pie>

            <Charts.Legend
              wrapperStyle={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'var(--font-size-body)',
              }}
            />
          </Charts.PieChart>
        </Charts.ResponsiveContainer>
      </Flex>
    </Card>
  );
}

function RequestsTable({ stats }: { stats?: ApiStatsData['page'] }) {
  return (
    <Table.Root padding="l">
      <Table.Head header={<H4>Endpoint Metrics</H4>}>
        <Table.Row>
          <Table.HeaderCell>Method</Table.HeaderCell>
          <Table.HeaderCell>Success</Table.HeaderCell>
          {/* <Table.HeaderCell>Invalid</Table.HeaderCell> */}
          <Table.HeaderCell>Failed</Table.HeaderCell>
        </Table.Row>
      </Table.Head>

      <Table.Body>
        {stats ? (
          <>
            {stats.map((row) => {
              return (
                <Table.Row key={row.endpointMethod}>
                  <Table.Cell>{row.endpointMethod}</Table.Cell>

                  <Table.Cell>
                    <Text family="number" color="primary" size="current">
                      {formatNumber(row.successCount)}
                    </Text>
                  </Table.Cell>

                  {/* <Table.Cell>
                    <Text family="number" color="warning" size="current">
                      0
                    </Text>
                  </Table.Cell> */}

                  <Table.Cell>
                    <Text family="number" color="danger" size="current">
                      {formatNumber(row.errorCount)}
                    </Text>
                  </Table.Cell>
                </Table.Row>
              );
            })}
          </>
        ) : (
          <Table.PlaceholderRows />
        )}
      </Table.Body>
    </Table.Root>
  );
}
