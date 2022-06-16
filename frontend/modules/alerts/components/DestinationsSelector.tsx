import { useState } from 'react';

import { Badge } from '@/components/lib/Badge';
import { Button } from '@/components/lib/Button';
import { Card } from '@/components/lib/Card';
import { FeatherIcon } from '@/components/lib/FeatherIcon';
import { Flex } from '@/components/lib/Flex';
import { Spinner } from '@/components/lib/Spinner';
import { Switch } from '@/components/lib/Switch';
import { Text } from '@/components/lib/Text';
import { useSelectedProject } from '@/hooks/selected-project';
import { useDestinations } from '@/modules/alerts/hooks/destinations';
import { destinationTypes } from '@/modules/alerts/utils/constants';

import type { Destination } from '../utils/types';
import { EditDestinationModal } from './EditDestinationModal';
import { NewDestinationModal } from './NewDestinationModal';

interface OnChangeEvent {
  destination: Destination;
  isSelected: boolean;
  selectedIds: number[];
}

interface Props {
  onChange: (event: OnChangeEvent) => void;
  selectedIds: number[];
}

export function DestinationsSelector({ onChange, selectedIds }: Props) {
  const { project } = useSelectedProject();
  const { destinations } = useDestinations(project?.slug);
  const [showNewDestinationModal, setShowNewDestinationModal] = useState(false);
  const [showEditDestinationModal, setShowEditDestinationModal] = useState(false);
  const [selectedEditDestination, setSelectedEditDestination] = useState<Destination>();

  function openDestination(destination: Destination) {
    setSelectedEditDestination(destination);
    setShowEditDestinationModal(true);
  }

  function toggleEnabledDestination(isSelected: boolean, destination: Destination) {
    const ids = selectedIds.filter((id) => id !== destination.id);

    if (isSelected) {
      ids.push(destination.id);
    }

    onChange({
      destination,
      isSelected,
      selectedIds: ids,
    });
  }

  return (
    <Flex stack>
      {!destinations && <Spinner center />}

      <Flex stack gap="s">
        {destinations?.map((destination) => {
          const destinationType = destinationTypes['webhook'];
          const isChecked = !!selectedIds.find((id) => id === destination.id);

          return (
            <Card padding="m" borderRadius="m" key={destination.id}>
              <Flex align="center">
                <Switch
                  checked={isChecked}
                  onCheckedChange={(value) => toggleEnabledDestination(value, destination)}
                  aria-label={`Destination: ${destination.name}`}
                />
                <FeatherIcon icon={destinationType.icon} color={isChecked ? 'primary' : 'text3'} size="m" />
                <Flex stack gap="none">
                  <Text color="text1" weight="semibold">
                    {destination.name}
                  </Text>
                  <Text size="bodySmall" family="code">
                    {destination.url}
                  </Text>
                </Flex>
                <Badge size="s">{destinationType.name}</Badge>
                <Button size="s" color="transparent" onClick={() => openDestination(destination)}>
                  <FeatherIcon icon="edit-2" size="xs" />
                </Button>
              </Flex>
            </Card>
          );
        })}

        <Button color="neutral" onClick={() => setShowNewDestinationModal(true)} stretch>
          <FeatherIcon icon="plus" color="primary" /> New Destination
        </Button>
      </Flex>

      {project && (
        <NewDestinationModal
          onCreate={(destination) => toggleEnabledDestination(true, destination)}
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
    </Flex>
  );
}
