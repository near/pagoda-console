import Link from 'next/link';

import { ButtonLink } from '@/components/lib/Button';
import { FeatherIcon } from '@/components/lib/FeatherIcon';
import { Flex } from '@/components/lib/Flex';
import { H1 } from '@/components/lib/Heading';
import { Spinner } from '@/components/lib/Spinner';
import { Text } from '@/components/lib/Text';
import { openToast } from '@/components/lib/Toast';
import type { Environment, Project } from '@/utils/types';

import { useAlerts } from '../hooks/alerts';
import { AlertCard } from './AlertCard';

export function Alerts({ environment, project }: { environment?: Environment; project?: Project }) {
  const { alerts, mutate } = useAlerts(project?.slug, environment?.subId);

  return (
    <Flex stack gap="l">
      <Flex justify="spaceBetween">
        <H1>Alerts</H1>
        <Link href="/alerts/new-alert" passHref>
          <ButtonLink stableId="new-alert">
            <FeatherIcon icon="plus" /> New Alert
          </ButtonLink>
        </Link>
      </Flex>

      {!alerts && <Spinner center />}

      {alerts?.length === 0 && <Text>{`Your selected environment doesn't have any alerts configured yet.`}</Text>}

      <Flex stack gap="s">
        {alerts?.map((alert) => {
          return (
            <AlertCard
              key={alert.id}
              alert={alert}
              onDelete={() => {
                const name = alert?.name;

                openToast({
                  type: 'success',
                  title: 'Alert Deleted',
                  description: name,
                });

                mutate(() => {
                  return alerts?.filter((a) => a.id !== alert.id);
                });
              }}
            />
          );
        })}
      </Flex>
    </Flex>
  );
}
