// import { useApiKeys } from '@/hooks/api-keys';
import { DateTime } from 'luxon';
import { useEffect, useState } from 'react';
import * as Charts from 'recharts';

import { Box } from '@/components/lib/Box';
import { Card } from '@/components/lib/Card';
import * as DropdownMenu from '@/components/lib/DropdownMenu';
import { FeatherIcon } from '@/components/lib/FeatherIcon';
import { Flex } from '@/components/lib/Flex';
import { H1, H4 } from '@/components/lib/Heading';
import { Placeholder } from '@/components/lib/Placeholder';
import { Switch } from '@/components/lib/Switch';
import * as Table from '@/components/lib/Table';
import { Text } from '@/components/lib/Text';
import { Tooltip } from '@/components/lib/Tooltip';
import config from '@/utils/config';
import { formatNumber } from '@/utils/format-number';
import type { Environment, Project } from '@/utils/types';

import { useApiStats } from '../hooks/api-stats';
import { timeRanges } from '../utils/constants';
import type { ApiStatsData, TimeRangeValue } from '../utils/types';

interface Props {
  environment?: Environment;
  project?: Project;
}

export function ApiStats({ environment, project }: Props) {
  // const { keys } = useApiKeys(project?.slug);  // for filtering
  const [selectedTimeRangeValue, setSelectedTimeRangeValue] = useState<TimeRangeValue>('30_DAYS');
  const [liveRefreshEnabled, setLiveRefreshEnabled] = useState(true);
  const selectedTimeRange = timeRanges.find((t) => t.value === selectedTimeRangeValue);
  const [rangeEndTime, setRangeEndTime] = useState(DateTime.now());
  const stats = useApiStats(environment, project, selectedTimeRangeValue, rangeEndTime);
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
          <H1 css={{ marginRight: 'auto' }}>RPC Statistics</H1>

          <Tooltip align="end" content={liveRefreshTooltipTitle}>
            <span>
              <Switch aria-label="Live Updates" checked={liveRefreshEnabled} onCheckedChange={setLiveRefreshEnabled}>
                <FeatherIcon icon="refresh-cw" size="xs" data-on />
                <FeatherIcon icon="pause" size="xs" data-off />
              </Switch>
            </span>
          </Tooltip>

          <DropdownMenu.Root>
            <DropdownMenu.Button css={{ width: '15rem' }}>
              <FeatherIcon icon="clock" color="primary" />
              {selectedTimeRange?.label}
            </DropdownMenu.Button>

            <DropdownMenu.Content width="trigger">
              <DropdownMenu.RadioGroup
                value={selectedTimeRangeValue}
                onValueChange={(value) => setSelectedTimeRangeValue(value as TimeRangeValue)}
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
      </Box>

      {stats?.totalRequestVolume === 0 ? (
        <>
          <Card>
            <Text>No Data for the selected time range.</Text>
          </Card>
        </>
      ) : (
        <>
          <TopLevelStats stats={stats} />

          <TotalRequestVolumeChart stats={stats} />

          <Box
            css={{
              display: 'grid',
              width: '100%',
              gap: 'var(--space-l)',
              gridTemplateColumns: 'repeat(auto-fit, minmax(30em, 1fr))',
            }}
          >
            {/* NOTE: Flex layout wasn't behaving with Rechart's <ResponsiveContainer /> component so we're using grid instead. */}
            <MethodBreakdownChart stats={stats} />
            <RequestStatusChart stats={stats} />
          </Box>

          <RequestsTable stats={stats} />
        </>
      )}
    </Flex>
  );
}

function TopLevelStats({ stats }: { stats?: ApiStatsData }) {
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

          {stats ? (
            <Text size="h4" family="number" color="text1">
              {formatNumber(stats.totalRequestVolume)}
            </Text>
          ) : (
            <Placeholder css={{ height: '2.6rem' }} />
          )}
        </Flex>
      </Card>

      <Card border>
        <Flex stack gap="s">
          <Text size="bodySmall" family="heading" color="text3">
            Request Success Rate
          </Text>

          {stats ? (
            <Text size="h4" family="number" color="text1">
              {stats.requestSuccessRatePercentage}%
            </Text>
          ) : (
            <Placeholder css={{ height: '2.6rem' }} />
          )}
        </Flex>
      </Card>

      <Card border>
        <Flex stack gap="s">
          <Text size="bodySmall" family="heading" color="text3">
            Number of Failed Requests
          </Text>

          {stats ? (
            <Text size="h4" family="number" color="text1">
              {formatNumber(stats.totalInvalidRequests)}
            </Text>
          ) : (
            <Placeholder css={{ height: '2.6rem' }} />
          )}
        </Flex>
      </Card>

      <Card border>
        <Flex stack gap="s">
          <Text size="bodySmall" family="heading" color="text3">
            Average Latency
          </Text>

          {stats ? (
            <Text size="h4" family="number" color="text1">
              {formatNumber(stats.requestLatencyMs)}ms
            </Text>
          ) : (
            <Placeholder css={{ height: '2.6rem' }} />
          )}
        </Flex>
      </Card>
    </Box>
  );
}

function TotalRequestVolumeChart({ stats }: { stats?: ApiStatsData }) {
  return (
    <Card>
      <Flex stack gap="l">
        <H4>Total Request Volume</H4>

        {stats ? (
          <Charts.ResponsiveContainer width="100%" height={250}>
            <Charts.LineChart data={stats.charts.totalRequestVolume}>
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

function MethodBreakdownChart({ stats }: { stats?: ApiStatsData }) {
  return (
    <Card>
      <Flex stack gap="l">
        <H4>Method Breakdown</H4>

        {stats ? (
          <Charts.ResponsiveContainer width="100%" height={250}>
            <Charts.BarChart layout="vertical" data={stats.charts.totalRequestsPerMethod}>
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
        ) : (
          <Placeholder css={{ height: 250 }} />
        )}
      </Flex>
    </Card>
  );
}

function RequestStatusChart({ stats }: { stats?: ApiStatsData }) {
  const colors: Record<string, string> = {
    Success: 'var(--color-success)',
    Failed: 'var(--color-danger)',
    Invalid: 'var(--color-warning)',
  };

  return (
    <Card>
      <Flex stack gap="l">
        <H4>Request Status</H4>

        {stats ? (
          <Charts.ResponsiveContainer width="100%" height={250}>
            <Charts.PieChart>
              <Charts.Pie
                dataKey="value"
                nameKey="label"
                data={stats.charts.totalRequestsPerStatus}
                label={(data) => formatNumber(data.payload.value)}
                fontFamily="var(--font-number)"
                fontSize="var(--font-size-body-small)"
                isAnimationActive={false}
                stroke="var(--color-border-1)"
              >
                {stats.charts.totalRequestsPerStatus.map((entry) => (
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
        ) : (
          <Placeholder css={{ height: 250 }} />
        )}
      </Flex>
    </Card>
  );
}

function RequestsTable({ stats }: { stats?: ApiStatsData }) {
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
            {stats.requestStatusPerMethod.map((row) => {
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
