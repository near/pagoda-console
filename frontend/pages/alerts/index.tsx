import Link from 'next/link';
import { useState } from 'react';

import { Badge } from '@/components/lib/Badge';
import { Button, ButtonLink } from '@/components/lib/Button';
import { Card } from '@/components/lib/Card';
import { FeatherIcon } from '@/components/lib/FeatherIcon';
import { Flex } from '@/components/lib/Flex';
import { H1 } from '@/components/lib/Heading';
import { Section } from '@/components/lib/Section';
import { Spinner } from '@/components/lib/Spinner';
import * as Table from '@/components/lib/Table';
import * as Tabs from '@/components/lib/Tabs';
import { Text } from '@/components/lib/Text';
import { TextOverflow } from '@/components/lib/TextOverflow';
import { useDashboardLayout } from '@/hooks/layouts';
import { useRouteParam } from '@/hooks/route';
import { useSelectedProject } from '@/hooks/selected-project';
import { EditDestinationModal } from '@/modules/alerts/components/EditDestinationModal';
import { NewDestinationModal } from '@/modules/alerts/components/NewDestinationModal';
import { useAlerts } from '@/modules/alerts/hooks/alerts';
import { useDestinations } from '@/modules/alerts/hooks/destinations';
import { useTriggeredAlerts } from '@/modules/alerts/hooks/triggered-alerts';
import { alertTypes, destinationTypes } from '@/modules/alerts/utils/constants';
import type { Destination } from '@/modules/alerts/utils/types';
import type { NextPageWithLayout } from '@/utils/types';

const ListAlerts: NextPageWithLayout = () => {
  const { environment, project } = useSelectedProject();
  const { triggeredAlerts } = useTriggeredAlerts(project?.slug, environment?.subId);
  const { alerts } = useAlerts(project?.slug, environment?.subId);
  const { destinations } = useDestinations(project?.slug);
  const [showNewDestinationModal, setShowNewDestinationModal] = useState(false);
  const [showEditDestinationModal, setShowEditDestinationModal] = useState(false);
  const [selectedEditDestination, setSelectedEditDestination] = useState<Destination>();
  const activeTab = useRouteParam('tab', '?tab=alerts', true);

  function openDestination(destination: Destination) {
    setSelectedEditDestination(destination);
    setShowEditDestinationModal(true);
  }

  return (
    <Section>
      <Tabs.Root value={activeTab || ''}>
        <Tabs.List>
          <Link href="?tab=history" passHref>
            <Tabs.TriggerLink active={activeTab === 'history'}>
              <FeatherIcon icon="bell" /> History
            </Tabs.TriggerLink>
          </Link>

          <Link href="?tab=alerts" passHref>
            <Tabs.TriggerLink active={activeTab === 'alerts'}>
              <FeatherIcon icon="bell" /> Alerts
            </Tabs.TriggerLink>
          </Link>

          <Link href="?tab=destinations" passHref>
            <Tabs.TriggerLink active={activeTab === 'destinations'}>
              <FeatherIcon icon="inbox" /> Destinations
            </Tabs.TriggerLink>
          </Link>
        </Tabs.List>

        <Tabs.Content value="history">
          <Flex stack gap="l">
            <Flex justify="spaceBetween"></Flex>
            <Flex stack gap="s">
              <Table.Root>
                <Table.Head>
                  <Table.Row>
                    <Table.HeaderCell>NAME</Table.HeaderCell>
                    <Table.HeaderCell>TYPE</Table.HeaderCell>
                    <Table.HeaderCell>TRANSACTION</Table.HeaderCell>
                    <Table.HeaderCell>ID</Table.HeaderCell>
                    <Table.HeaderCell>TIME</Table.HeaderCell>
                    {/* <Table.HeaderCell>triggeredInReceiptId</Table.HeaderCell>
                    <Table.HeaderCell>triggeredInBlockHash</Table.HeaderCell>
                    <Table.HeaderCell>extraData</Table.HeaderCell> */}
                  </Table.Row>
                </Table.Head>

                <Table.Body>
                  {triggeredAlerts?.map((row) => {
                    return (
                      <Table.Row key={row.triggeredAlertReferenceId}>
                        <Table.Cell>
                          <Flex align="center" gap="s">
                            {row.name}
                          </Flex>
                        </Table.Cell>
                        <Table.Cell>
                          <Flex align="center" gap="s">
                            {row.type}
                          </Flex>
                        </Table.Cell>
                        <Table.Cell>
                          <Text family="number" color="text3" size="current">
                            {row.triggeredInTransactionHash}
                          </Text>
                        </Table.Cell>
                        <Table.Cell>
                          <Text family="number" color="text3" size="current">
                            {row.triggeredAlertReferenceId}
                          </Text>
                        </Table.Cell>
                        <Table.Cell>
                          <Text family="number" color="text3" size="current">
                            {row.triggeredAt}
                          </Text>
                        </Table.Cell>
                      </Table.Row>
                    );
                  })}
                </Table.Body>
              </Table.Root>
            </Flex>
          </Flex>
        </Tabs.Content>

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
        </Tabs.Content>

        <Tabs.Content value="destinations">
          <Flex stack gap="l">
            <Flex justify="spaceBetween">
              <H1>Destinations</H1>
              <Button onClick={() => setShowNewDestinationModal(true)}>
                <FeatherIcon icon="plus" /> New Destination
              </Button>
            </Flex>

            {!destinations && <Spinner center />}

            {destinations?.length === 0 && (
              <Text>{`Your selected project doesn't have any destinations configured yet.`}</Text>
            )}

            <Flex stack gap="s">
              {destinations?.map((destination) => {
                const destinationType = destinationTypes[destination.type];

                return (
                  <Card
                    as="button"
                    type="button"
                    clickable
                    padding="m"
                    borderRadius="m"
                    key={destination.id}
                    onClick={() => openDestination(destination)}
                  >
                    <Flex align="center">
                      <FeatherIcon icon={destinationType.icon} color="primary" size="m" />
                      <Flex stack gap="none" css={{ minWidth: 0 }}>
                        <Text color="text1" css={{ width: '100%' }}>
                          <TextOverflow>{destination.name}</TextOverflow>
                        </Text>
                        <Text family="code" size="bodySmall" css={{ width: '100%' }}>
                          <TextOverflow>
                            {destination.type === 'TELEGRAM' && destination.config.chatTitle}
                            {destination.type === 'WEBHOOK' && destination.config.url}
                          </TextOverflow>
                        </Text>
                      </Flex>
                      <Badge size="s" css={{ marginLeft: 'auto' }}>
                        {destinationType.name}
                      </Badge>
                      {!destination.isValid && (
                        <Badge size="s" color="warning">
                          <FeatherIcon icon="alert-triangle" size="xs" />
                          Needs Action
                        </Badge>
                      )}
                    </Flex>
                  </Card>
                );
              })}
            </Flex>
          </Flex>
        </Tabs.Content>
      </Tabs.Root>

      {project && (
        <NewDestinationModal
          projectSlug={project.slug}
          show={showNewDestinationModal}
          setShow={setShowNewDestinationModal}
        />
      )}

      {selectedEditDestination && (
        <EditDestinationModal
          destination={selectedEditDestination}
          show={showEditDestinationModal}
          setShow={setShowEditDestinationModal}
        />
      )}
    </Section>
  );
};

ListAlerts.getLayout = useDashboardLayout;

export default ListAlerts;
