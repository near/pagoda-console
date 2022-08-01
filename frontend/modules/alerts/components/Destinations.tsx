import { useState } from 'react';

import { Badge } from '@/components/lib/Badge';
import { Button } from '@/components/lib/Button';
import { Card } from '@/components/lib/Card';
import { FeatherIcon } from '@/components/lib/FeatherIcon';
import { Flex } from '@/components/lib/Flex';
import { H1 } from '@/components/lib/Heading';
import { Spinner } from '@/components/lib/Spinner';
import { Text } from '@/components/lib/Text';
import { TextOverflow } from '@/components/lib/TextOverflow';
import { EditDestinationModal } from '@/modules/alerts/components/EditDestinationModal';
import { NewDestinationModal } from '@/modules/alerts/components/NewDestinationModal';
import { useDestinations } from '@/modules/alerts/hooks/destinations';
import { destinationTypes } from '@/modules/alerts/utils/constants';
import type { Destination } from '@/modules/alerts/utils/types';
import type { Project } from '@/utils/types';

export function Destinations({ project }: { project?: Project }) {
  const { destinations } = useDestinations(project?.slug);
  const [showNewDestinationModal, setShowNewDestinationModal] = useState(false);
  const [showEditDestinationModal, setShowEditDestinationModal] = useState(false);
  const [selectedEditDestination, setSelectedEditDestination] = useState<Destination>();

  function openDestination(destination: Destination) {
    setSelectedEditDestination(destination);
    setShowEditDestinationModal(true);
  }

  return (
    <>
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
    </>
  );
}
