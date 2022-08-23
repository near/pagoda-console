import Link from 'next/link';

import { Badge } from '@/components/lib/Badge';
import { ButtonLink } from '@/components/lib/Button';
import { Card } from '@/components/lib/Card';
import { FeatherIcon } from '@/components/lib/FeatherIcon';
import { Flex } from '@/components/lib/Flex';
import { H1 } from '@/components/lib/Heading';
import { Spinner } from '@/components/lib/Spinner';
import { Text } from '@/components/lib/Text';
import { TextOverflow } from '@/components/lib/TextOverflow';
import type { Environment, Project } from '@/utils/types';

import { useAlerts } from '../hooks/alerts';
import { alertTypes } from '../utils/constants';

export function Alerts({ environment, project }: { environment?: Environment; project?: Project }) {
  const { alerts } = useAlerts(project?.slug, environment?.subId);

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
          const alertType = alertTypes[alert.type];

          return (
            <Link href={`/alerts/edit-alert/${alert.id}`} passHref key={alert.id}>
              <Card as="a" clickable padding="m" borderRadius="m">
                <Flex align="center">
                  <FeatherIcon icon={alertType.icon} color="primary" size="m" />
                  <Text color="text1" css={{ minWidth: 0 }}>
                    <TextOverflow>{alert.name}</TextOverflow>
                  </Text>
                  <Badge size="s" css={{ marginLeft: 'auto' }}>
                    {alertType.name}
                  </Badge>
                  {alert.isPaused ? (
                    <Badge size="s">
                      <FeatherIcon icon="pause" size="xs" /> Paused
                    </Badge>
                  ) : (
                    <Badge size="s">
                      <FeatherIcon icon="bell" size="xs" /> Active
                    </Badge>
                  )}
                </Flex>
              </Card>
            </Link>
          );
        })}
      </Flex>
    </Flex>
  );
}
