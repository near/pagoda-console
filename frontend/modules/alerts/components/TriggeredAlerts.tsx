import { DateTime } from 'luxon';
import Link from 'next/link';
import { useEffect } from 'react';

import { Badge } from '@/components/lib/Badge';
import { Card } from '@/components/lib/Card';
import { FeatherIcon } from '@/components/lib/FeatherIcon';
import { Flex } from '@/components/lib/Flex';
import { H5 } from '@/components/lib/Heading';
import { Pagination } from '@/components/lib/Pagination';
import { Placeholder } from '@/components/lib/Placeholder';
import { Switch } from '@/components/lib/Switch';
import * as Table from '@/components/lib/Table';
import { Text } from '@/components/lib/Text';
import { TextLink } from '@/components/lib/TextLink';
import { Tooltip } from '@/components/lib/Tooltip';
import { usePagination } from '@/hooks/pagination';
import { useOnSelectedProjectChange } from '@/hooks/selected-project';
import { truncateMiddle } from '@/utils/truncate-middle';
import type { Environment, Project } from '@/utils/types';

import { useAlerts } from '../hooks/alerts';
import { useTriggeredAlerts, useTriggeredAlertsCount } from '../hooks/triggered-alerts';
import { alertTypes } from '../utils/constants';
import type { TriggeredAlert } from '../utils/types';

export function TriggeredAlerts({ environment, project }: { environment?: Environment; project?: Project }) {
  const pagination = usePagination();
  const { triggeredAlertsCount } = useTriggeredAlertsCount(project?.slug, environment?.subId, pagination);
  const { triggeredAlerts } = useTriggeredAlerts(project?.slug, environment?.subId, pagination);
  const { alerts } = useAlerts(project?.slug, environment?.subId);

  useEffect(() => {
    pagination.updateItemCount(triggeredAlertsCount);
  });

  useOnSelectedProjectChange(() => {
    pagination.reset();
  });

  function shouldFlashRow(alert: TriggeredAlert) {
    let result = false;

    if (pagination.state.liveRefreshEnabled) {
      const date = DateTime.fromISO(alert.triggeredAt);
      result = date > pagination.state.initialLoadDateTime;
    }

    return result;
  }

  if (alerts?.length === 0 || triggeredAlertsCount == 0) {
    return (
      <Card>
        <Flex stack align="center">
          <FeatherIcon icon="bell-off" size="l" />

          {alerts?.length === 0 ? (
            <>
              <Text>{`Your selected environment doesn't have any alerts configured yet.`}</Text>

              <Link href="/alerts/new-alert" passHref>
                <TextLink>Create an Alert</TextLink>
              </Link>
            </>
          ) : (
            <Text>{`No alerts have triggered in your selected environment yet.`}</Text>
          )}
        </Flex>
      </Card>
    );
  }

  return (
    <Flex stack gap="l">
      <Table.Root>
        <Table.Head
          header={
            <Flex align="center" justify="spaceBetween">
              {triggeredAlertsCount === undefined ? (
                <Placeholder css={{ width: '15rem', height: '1.5rem' }} />
              ) : (
                <H5>{triggeredAlertsCount} Triggered Alerts</H5>
              )}

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
            const alertTypeOption = alertTypes[row.type];
            return (
              <Table.Row flash={shouldFlashRow(row)} key={row.triggeredAlertSlug}>
                <Table.Cell>{row.name}</Table.Cell>
                <Table.Cell>
                  <Badge size="s">
                    <FeatherIcon icon={alertTypeOption.icon} size="xs" />
                    {alertTypeOption.name}
                  </Badge>
                </Table.Cell>
                <Table.Cell>
                  <Text family="number" color="text3" size="current">
                    {truncateMiddle(row.triggeredInTransactionHash)}
                  </Text>
                </Table.Cell>
                <Table.Cell>
                  <Text family="number" color="text3" size="current">
                    {truncateMiddle(row.triggeredAlertSlug)}
                  </Text>
                </Table.Cell>
                <Table.Cell>
                  <Text family="number" color="text3" size="current">
                    {DateTime.fromISO(row.triggeredAt)?.toLocaleString(DateTime.DATETIME_SHORT)}
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
