import type { Api } from '@pc/common/types/api';
import { DateTime } from 'luxon';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { Badge } from '@/components/lib/Badge';
import { Card } from '@/components/lib/Card';
import * as DropdownMenu from '@/components/lib/DropdownMenu';
import { FeatherIcon } from '@/components/lib/FeatherIcon';
import { Flex } from '@/components/lib/Flex';
import { Pagination } from '@/components/lib/Pagination';
import { Placeholder } from '@/components/lib/Placeholder';
import { Switch } from '@/components/lib/Switch';
import * as Table from '@/components/lib/Table';
import { Text } from '@/components/lib/Text';
import { TextLink } from '@/components/lib/TextLink';
import { TextOverflow } from '@/components/lib/TextOverflow';
import { Tooltip } from '@/components/lib/Tooltip';
import { usePagination } from '@/hooks/pagination';
import { useRouteParam } from '@/hooks/route';
import { useOnSelectedProjectChange } from '@/hooks/selected-project';
import { StableId } from '@/utils/stable-ids';
import { truncateMiddle } from '@/utils/truncate-middle';

import { useAlerts } from '../hooks/alerts';
import { useTriggeredAlerts } from '../hooks/triggered-alerts';
import { alertTypes } from '../utils/constants';

type Environment = Api.Query.Output<'/projects/getEnvironments'>[number];
type Project = Api.Query.Output<'/projects/getDetails'>;
type TriggeredAlert = Api.Query.Output<'/triggeredAlerts/listTriggeredAlerts'>['page'][number];

export function TriggeredAlerts({ environment, project }: { environment?: Environment; project?: Project }) {
  const queryParamAlertFilter = useRouteParam('alertId');
  const pagination = usePagination();
  const [filteredAlertId, setFilteredAlertId] = useState(
    queryParamAlertFilter ? parseInt(queryParamAlertFilter) : undefined,
  );
  const filters = { alertId: filteredAlertId };
  const { triggeredAlertsCount, triggeredAlerts } = useTriggeredAlerts(
    project?.slug,
    environment?.subId,
    pagination,
    filters,
  );
  const { alerts } = useAlerts(project?.slug, environment?.subId);
  const filteredAlert = alerts?.find((alert) => alert.id === filteredAlertId);

  useEffect(() => {
    pagination.updateItemCount(triggeredAlertsCount);
  });

  useOnSelectedProjectChange(() => {
    clearAlertFilter();
  });

  function shouldFlashRow(alert: TriggeredAlert) {
    let result = false;

    if (pagination.state.liveRefreshEnabled) {
      const date = DateTime.fromISO(alert.triggeredAt);
      result = date > pagination.state.lastItemCountUpdateDateTime;
    }

    return result;
  }

  function onSelectAlertFilter(alertId: string) {
    pagination.reset();
    setFilteredAlertId(parseInt(alertId));
  }

  function clearAlertFilter() {
    pagination.reset();
    setFilteredAlertId(undefined);
  }

  if (alerts?.length === 0) {
    return (
      <Card>
        <Flex stack align="center">
          <FeatherIcon icon="bell-off" size="l" />
          <Text>{`Your selected environment doesn't have any alerts configured yet.`}</Text>
          <Link href="/alerts/new-alert" passHref>
            <TextLink stableId={StableId.TRIGGERED_ALERTS_CREATE_ALERT_LINK}>Create an Alert</TextLink>
          </Link>
        </Flex>
      </Card>
    );
  }

  return (
    <Flex stack gap="l">
      <Table.Root>
        <Table.Head
          header={
            <Flex align={{ '@initial': 'center', '@tablet': 'start' }} stack={{ '@tablet': true }}>
              <Flex align={{ '@initial': 'center', '@tablet': 'start' }} stack={{ '@tablet': true }}>
                {triggeredAlertsCount === undefined ? (
                  <Placeholder css={{ width: '15rem', height: '1.5rem' }} />
                ) : (
                  <>
                    <DropdownMenu.Root>
                      <DropdownMenu.Button
                        stableId={StableId.TRIGGERED_ALERTS_ALERT_FILTER_DROPDOWN}
                        css={{ width: '20rem' }}
                        size="s"
                      >
                        <TextOverflow>{filteredAlert?.name || 'All Alerts'}</TextOverflow>
                      </DropdownMenu.Button>

                      <DropdownMenu.Content align="start">
                        {filteredAlert && (
                          <DropdownMenu.Item key={'clear'} onSelect={() => clearAlertFilter()}>
                            <FeatherIcon icon="x" size="s" color="text3" />
                            <Text color="text3">Clear Filter</Text>
                          </DropdownMenu.Item>
                        )}

                        <DropdownMenu.RadioGroup
                          value={filteredAlert?.id?.toString()}
                          onValueChange={onSelectAlertFilter}
                        >
                          {alerts?.map((a) => {
                            const alertTypeOption = alertTypes[a.rule.type];
                            return (
                              <DropdownMenu.RadioItem
                                key={a.id}
                                value={a.id?.toString()}
                                indicator={<FeatherIcon icon={alertTypeOption.icon} />}
                              >
                                {a.name}
                              </DropdownMenu.RadioItem>
                            );
                          })}
                        </DropdownMenu.RadioGroup>
                      </DropdownMenu.Content>
                    </DropdownMenu.Root>
                    <Text>{triggeredAlertsCount} Triggered Alerts</Text>
                  </>
                )}
              </Flex>

              <Tooltip
                align="end"
                content={
                  pagination.state.liveRefreshEnabled
                    ? 'Disable live updates'
                    : pagination.state.currentPage === 1
                    ? 'Enable live updates'
                    : 'Enable live updates. This will take you back to the first page.'
                }
              >
                <span>
                  <Switch
                    stableId={StableId.TRIGGERED_ALERTS_LIVE_UPDATES_SWITCH}
                    aria-label="Live Updates"
                    checked={pagination.state.liveRefreshEnabled}
                    onCheckedChange={pagination.updateLiveRefresh}
                  >
                    <FeatherIcon icon="refresh-cw" size="xs" data-on />
                    <FeatherIcon icon="pause" size="xs" data-off />
                  </Switch>
                </span>
              </Tooltip>
            </Flex>
          }
        >
          <Table.Row>
            <Table.HeaderCell>Name</Table.HeaderCell>
            <Table.HeaderCell>Type</Table.HeaderCell>
            <Table.HeaderCell>Transaction</Table.HeaderCell>
            <Table.HeaderCell>Id</Table.HeaderCell>
            <Table.HeaderCell>Time</Table.HeaderCell>
          </Table.Row>
        </Table.Head>

        <Table.Body>
          {!triggeredAlerts && <Table.PlaceholderRows />}

          {triggeredAlerts?.map((row) => {
            const url = `/alerts/triggered-alert/${row.slug}`;
            const alertTypeOption = alertTypes[row.type];

            return (
              <Table.Row flash={shouldFlashRow(row)} key={row.slug}>
                <Table.Cell href={url} wrap css={{ minWidth: '10rem' }}>
                  {row.name}
                </Table.Cell>
                <Table.Cell href={url}>
                  <Badge size="s">
                    <FeatherIcon icon={alertTypeOption.icon} size="xs" />
                    {alertTypeOption.name}
                  </Badge>
                </Table.Cell>
                <Table.Cell href={url}>
                  <Text family="number" color="text3" size="current">
                    {row.triggeredInTransactionHash ? truncateMiddle(row.triggeredInTransactionHash) : null}
                  </Text>
                </Table.Cell>
                <Table.Cell href={url}>
                  <Text family="number" color="text3" size="current">
                    {truncateMiddle(row.slug)}
                  </Text>
                </Table.Cell>
                <Table.Cell href={url}>
                  <Text family="number" color="text3" size="current">
                    {DateTime.fromISO(row.triggeredAt)?.toLocaleString(DateTime.DATETIME_SHORT_WITH_SECONDS)}
                  </Text>
                </Table.Cell>
              </Table.Row>
            );
          })}
        </Table.Body>

        <Table.Foot>
          <Table.Row>
            <Table.Cell colSpan={100}>
              <Pagination pagination={pagination} totalCount={triggeredAlertsCount} />
            </Table.Cell>
          </Table.Row>
        </Table.Foot>
      </Table.Root>
    </Flex>
  );
}
