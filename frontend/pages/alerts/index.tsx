import Link from 'next/link';
import { useRouter } from 'next/router';

import { ButtonLink } from '@/components/lib/Button';
import { Card } from '@/components/lib/Card';
import { FeatherIcon } from '@/components/lib/FeatherIcon';
import { Flex } from '@/components/lib/Flex';
import { H1 } from '@/components/lib/Heading';
import { Section } from '@/components/lib/Section';
import { Spinner } from '@/components/lib/Spinner';
import * as Tabs from '@/components/lib/Tabs';
import { Text } from '@/components/lib/Text';
import { useDashboardLayout } from '@/hooks/layouts';
import { useRouteParam } from '@/hooks/route';
import { useSelectedProject } from '@/hooks/selected-project';
import { useAlerts } from '@/modules/alerts/hooks/alerts';
import { alertTypes } from '@/modules/alerts/utils/constants';
import type { NextPageWithLayout } from '@/utils/types';

const ListAlerts: NextPageWithLayout = () => {
  const router = useRouter();
  const selectedTab = useRouteParam('tab');
  const { environment } = useSelectedProject();
  const { alerts } = useAlerts(environment?.subId);

  function onTabChange(value: string) {
    router.replace(`?tab=${value}`);
  }

  return (
    <Section>
      <Tabs.Root value={selectedTab || 'alerts'} onValueChange={onTabChange}>
        <Tabs.List>
          <Tabs.Trigger value="alerts">
            <FeatherIcon icon="bell" /> Alerts
          </Tabs.Trigger>
          <Tabs.Trigger value="destinations">
            <FeatherIcon icon="external-link" /> Destinations
          </Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="alerts">
          <Flex stack gap="l">
            <Flex justify="spaceBetween">
              <H1>Alerts</H1>
              <Link href="/alerts/new-alert" passHref>
                <ButtonLink>
                  <FeatherIcon icon="plus" /> New Alert
                </ButtonLink>
              </Link>
            </Flex>

            {!alerts && <Spinner center />}

            {alerts?.length === 0 && (
              <Text>{`You don't have any alerts configured for your selected environment yet.`}</Text>
            )}

            <Flex stack gap="s">
              {alerts?.map((alert) => {
                const alertType = alertTypes[alert.type];

                return (
                  <Link href={`/alerts/edit-alert/${alert.id}`} passHref key={alert.id}>
                    <Card as="a" clickable padding="m" borderRadius="m">
                      <Flex align="center">
                        <FeatherIcon icon={alertType.icon} color="primary" />
                        <Flex stack gap="none">
                          <Text color="text1">{alert.name}</Text>
                          <Text size="bodySmall">Destination or other meta info here...</Text>
                        </Flex>
                      </Flex>
                    </Card>
                  </Link>
                );
              })}
            </Flex>
          </Flex>
        </Tabs.Content>

        <Tabs.Content value="destinations">
          <Flex stack>
            <H1>Destinations</H1>
            <Text>Some tab 2 content.</Text>
          </Flex>
        </Tabs.Content>
      </Tabs.Root>
    </Section>
  );
};

ListAlerts.getLayout = useDashboardLayout;

export default ListAlerts;
