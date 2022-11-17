import Link from 'next/link';

import { ButtonLink } from '@/components/lib/Button';
import { FeatherIcon } from '@/components/lib/FeatherIcon';
import { Flex } from '@/components/lib/Flex';
import { H1 } from '@/components/lib/Heading';
import { Spinner } from '@/components/lib/Spinner';
import * as Table from '@/components/lib/Table';
import { Text } from '@/components/lib/Text';
import { openToast } from '@/components/lib/Toast';
import { useSureProjectContext } from '@/hooks/project-context';
import { useQuery } from '@/hooks/query';
import { StableId } from '@/utils/stable-ids';

import { AlertTableRow } from './AlertTableRow';

export function Alerts() {
  const { environmentSubId, projectSlug } = useSureProjectContext();
  const alertsQuery = useQuery(['/alerts/listAlerts', { projectSlug, environmentSubId }]);

  return (
    <Flex stack gap="l">
      <Flex justify="spaceBetween">
        <H1>Alerts</H1>
        <Link href="/alerts/new-alert" passHref>
          <ButtonLink stableId={StableId.ALERTS_NEW_ALERT_LINK}>
            <FeatherIcon icon="plus" /> New Alert
          </ButtonLink>
        </Link>
      </Flex>

      {alertsQuery.status === 'loading' ? (
        <Spinner center />
      ) : alertsQuery.status === 'error' ? (
        <Text>Error while loading alerts</Text>
      ) : alertsQuery.data.length === 0 ? (
        <Text>{`Your selected environment doesn't have any alerts configured yet.`}</Text>
      ) : (
        <Table.Root>
          <Table.Head>
            <Table.Row>
              <Table.HeaderCell></Table.HeaderCell>
              <Table.HeaderCell>Name</Table.HeaderCell>
              <Table.HeaderCell>Type</Table.HeaderCell>
              <Table.HeaderCell></Table.HeaderCell>
              <Table.HeaderCell></Table.HeaderCell>
            </Table.Row>
          </Table.Head>

          <Table.Body>
            {alertsQuery.data.map((row) => {
              return (
                <AlertTableRow
                  alert={row}
                  onDelete={() => {
                    openToast({
                      type: 'success',
                      title: 'Alert Deleted',
                      description: row?.name,
                    });
                  }}
                  key={row.id}
                />
              );
            })}
          </Table.Body>
        </Table.Root>
      )}
    </Flex>
  );
}
