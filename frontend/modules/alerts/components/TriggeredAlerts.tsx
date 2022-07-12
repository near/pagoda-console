import { DateTime } from 'luxon';
import Link from 'next/link';
import { useEffect } from 'react';

import { Badge } from '@/components/lib/Badge';
import { Card } from '@/components/lib/Card';
import { FeatherIcon } from '@/components/lib/FeatherIcon';
import { Flex } from '@/components/lib/Flex';
import { Pagination } from '@/components/lib/Pagination';
import { Spinner } from '@/components/lib/Spinner';
import * as Table from '@/components/lib/Table';
import { Text } from '@/components/lib/Text';
import { TextLink } from '@/components/lib/TextLink';
import { usePagination } from '@/hooks/pagination';
import { truncateMiddle } from '@/utils/truncate-middle';
import type { Environment, Project } from '@/utils/types';

import { useAlerts } from '../hooks/alerts';
import { useTriggeredAlerts, useTriggeredAlertsCount } from '../hooks/triggered-alerts';
import { alertTypes } from '../utils/constants';

export function TriggeredAlerts({ environment, project }: { environment?: Environment; project?: Project }) {
  const pagination = usePagination();
  const { triggeredAlertsCount } = useTriggeredAlertsCount(project?.slug, environment?.subId, pagination);
  const { isLoadingPage, triggeredAlerts } = useTriggeredAlerts(project?.slug, environment?.subId, pagination);
  const { alerts } = useAlerts(project?.slug, environment?.subId);

  useEffect(() => {
    pagination.updateItemCount(triggeredAlertsCount);
  });

  if (!triggeredAlerts) {
    return <Spinner center />;
  }

  if (triggeredAlertsCount === 0) {
    if (!alerts) {
      return <Spinner center />;
    }

    if (alerts?.length === 0) {
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
              <Text>{`Your selected environment doesn't have any triggered alerts yet.`}</Text>
            )}
          </Flex>
        </Card>
      );
    }
  }

  return (
    <Flex stack gap="l">
      <Flex stack gap="s">
        <Table.Root>
          <Table.Head>
            <Table.Row>
              <Table.HeaderCell>Name</Table.HeaderCell>
              <Table.HeaderCell>Type</Table.HeaderCell>
              <Table.HeaderCell>Transaction</Table.HeaderCell>
              <Table.HeaderCell>Id</Table.HeaderCell>
              <Table.HeaderCell>Time</Table.HeaderCell>
            </Table.Row>
          </Table.Head>

          <Table.Body>
            {triggeredAlerts?.map((row) => {
              const alertTypeOption = alertTypes[row.type];
              return (
                <Table.Row key={row.triggeredAlertReferenceId}>
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
                      {truncateMiddle(row.triggeredAlertReferenceId)}
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
        </Table.Root>
      </Flex>

      <Pagination isLoadingPage={isLoadingPage} pagination={pagination} totalCount={triggeredAlertsCount} />
    </Flex>
  );
}
