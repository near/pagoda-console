import Link from 'next/link';

import { ButtonLink } from '@/components/lib/Button';
import { FeatherIcon } from '@/components/lib/FeatherIcon';
import { Flex } from '@/components/lib/Flex';
import { H1 } from '@/components/lib/Heading';
import { Spinner } from '@/components/lib/Spinner';
import * as Table from '@/components/lib/Table';
import { Text } from '@/components/lib/Text';
import { useQuery } from '@/hooks/query';
import { useSelectedProject } from '@/hooks/selected-project';
import { StableId } from '@/utils/stable-ids';

import { AlertTableRow } from './AlertTableRow';

export function Alerts() {
  const { project, environment } = useSelectedProject();
  const alertsQuery = useQuery(
    ['/alerts/listAlerts', { projectSlug: project?.slug ?? 'unknown', environmentSubId: environment?.subId ?? -1 }],
    { enabled: Boolean(project && environment) },
  );

  return (
    <Flex stack gap="l">
      <Flex justify="spaceBetween" align="center">
        <H1>Alerts</H1>
        <Link href="/alerts/new-alert" passHref>
          <ButtonLink stableId={StableId.ALERTS_NEW_ALERT_LINK} hideText="mobile">
            <FeatherIcon icon="plus" /> New Alert
          </ButtonLink>
        </Link>
      </Flex>

      {alertsQuery.status === 'loading' ? (
        <Spinner center />
      ) : alertsQuery.status === 'error' ? null : alertsQuery.data.length === 0 ? (
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
            {alertsQuery.data.map((row) => (
              <AlertTableRow alert={row} key={row.id} />
            ))}
          </Table.Body>
        </Table.Root>
      )}
    </Flex>
  );
}
