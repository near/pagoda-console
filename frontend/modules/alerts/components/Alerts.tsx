import type { Api } from '@pc/common/types/api';
import Link from 'next/link';

import { ButtonLink } from '@/components/lib/Button';
import { FeatherIcon } from '@/components/lib/FeatherIcon';
import { Flex } from '@/components/lib/Flex';
import { H1 } from '@/components/lib/Heading';
import { Spinner } from '@/components/lib/Spinner';
import * as Table from '@/components/lib/Table';
import { Text } from '@/components/lib/Text';
import { openToast } from '@/components/lib/Toast';
import { StableId } from '@/utils/stable-ids';

import { useAlerts } from '../hooks/alerts';
import { AlertTableRow } from './AlertTableRow';

type Environment = Api.Query.Output<'/projects/getEnvironments'>[number];
type Project = Api.Query.Output<'/projects/getDetails'>;

export function Alerts({ environment, project }: { environment?: Environment; project?: Project }) {
  const { alerts, mutate } = useAlerts(project?.slug, environment?.subId);

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

      {!alerts && <Spinner center />}

      {alerts?.length === 0 && <Text>{`Your selected environment doesn't have any alerts configured yet.`}</Text>}

      {alerts && alerts?.length > 0 && (
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
            {!alerts && <Table.PlaceholderRows />}

            {alerts?.map((row) => {
              return (
                <AlertTableRow
                  alert={row}
                  onDelete={() => {
                    const name = row?.name;

                    openToast({
                      type: 'success',
                      title: 'Alert Deleted',
                      description: name,
                    });

                    mutate(() => {
                      return alerts?.filter((a) => a.id !== row.id);
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
