import type { Api } from '@pc/common/types/api';
import type { Dispatch, SetStateAction } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';

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
import { StableId } from '@/utils/stable-ids';

import { EditDestinationModal } from './EditDestinationModal';
import { NewDestinationModal } from './NewDestinationModal';

type Destination = Api.Query.Output<'/alerts/listDestinations'>[number];

export interface OnDestinationSelectionChangeEvent {
  destination: Destination;
  isSelected: boolean;
  selectedIds: number[];
}

interface Props {
  debounce?: boolean;
  onChange?: (event: OnDestinationSelectionChangeEvent) => void;
  selectedIds: number[];
  setSelectedIds: Dispatch<SetStateAction<number[]>>;
}

function toggleDestination(
  isSelected: boolean,
  destination: Destination,
  setSelectedIds: Dispatch<SetStateAction<number[]>>,
  onChange?: (event: OnDestinationSelectionChangeEvent) => void,
) {
  if (!destination.isValid) return;

  let ids: number[] = [];

  setSelectedIds((value) => {
    ids = value.filter((id) => id !== destination.id);
    if (isSelected) {
      ids.push(destination.id);
    }
    return ids;
  });

  if (onChange) {
    onChange({
      destination,
      isSelected,
      selectedIds: ids,
    });
  }
}

export function DestinationsSelector(props: Props) {
  const { project } = useSelectedProject();
  const { destinations } = useDestinations(project?.slug);
  const [showNewDestinationModal, setShowNewDestinationModal] = useState(false);
  const [showEditDestinationModal, setShowEditDestinationModal] = useState(false);
  const [selectedEditDestinationId, setSelectedEditDestinationId] = useState<number>();
  const previousDestinations = useRef<Destination[]>([]);
  const selectedEditDestination = destinations?.find((d) => d.id === selectedEditDestinationId);

  useEffect(() => {
    destinations?.forEach((current) => {
      const previous = previousDestinations.current.find((p) => p.id === current.id);

      if (current.isValid && previous && !previous.isValid) {
        toggleDestination(true, current, props.setSelectedIds, props.onChange);
      }
    });

    previousDestinations.current = [...(destinations || [])];
  }, [destinations, props]);

  function openDestination(destination: Destination) {
    setSelectedEditDestinationId(destination.id);
    setShowEditDestinationModal(true);
  }

  return (
    <Flex stack>
      {!destinations && <Spinner center />}

      {destinations?.length === 0 && (
        <Text>{`Your selected project doesn't have any destinations configured yet.`}</Text>
      )}

      <Flex stack gap="s">
        {destinations?.map((destination) => {
          return (
            <DestinationCard
              destination={destination}
              openDestination={openDestination}
              {...props}
              key={destination.id}
            />
          );
        })}

        <Button
          color="neutral"
          onClick={() => setShowNewDestinationModal(true)}
          stretch
          stableId={StableId.DESTINATIONS_SELECTOR_OPEN_CREATE_MODAL_BUTTON}
        >
          <FeatherIcon icon="plus" color="primary" /> New Destination
        </Button>
      </Flex>

      {project && (
        <NewDestinationModal
          onCreate={(destination) => toggleDestination(true, destination, props.setSelectedIds, props.onChange)}
          onVerify={(destination) => toggleDestination(true, destination, props.setSelectedIds, props.onChange)}
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

type DestinationCardProps = Props & {
  destination: Destination;
  openDestination: (destination: Destination) => void;
};

function DestinationCard({
  destination,
  debounce = true,
  openDestination,
  onChange,
  selectedIds,
  setSelectedIds,
}: DestinationCardProps) {
  const destinationType = destinationTypes[destination.type];
  const isChecked = !!selectedIds.find((id) => id === destination.id);

  const onCheckedChange = useCallback(
    (isSelected: boolean) => {
      toggleDestination(isSelected, destination, setSelectedIds, onChange);
    },
    [destination, onChange, setSelectedIds],
  );

  return (
    <Card padding="m" borderRadius="m">
      <Flex align="center">
        <Switch
          stableId={StableId.DESTINATIONS_SELECTOR_SELECTED_SWITCH}
          checked={isChecked}
          onCheckedChange={onCheckedChange}
          debounce={debounce}
          aria-label={`Destination: ${destination.name}`}
          disabled={!destination.isValid}
        />
        <FeatherIcon icon={destinationType.icon} color={isChecked ? 'primary' : 'text3'} size="m" />
        <Flex stack gap="none">
          <Text color="text1" weight="semibold">
            {destination.name}
          </Text>
          <Text size="bodySmall" family="code">
            {destination.type === 'TELEGRAM' && destination.config.chatTitle}
            {destination.type === 'WEBHOOK' && destination.config.url}
            {destination.type === 'EMAIL' && destination.config.email}
          </Text>
        </Flex>
        {!destination.isValid && (
          <Badge
            as="button"
            type="button"
            size="s"
            color="warning"
            clickable
            onClick={() => openDestination(destination)}
          >
            <FeatherIcon icon="alert-triangle" size="xs" />
            Needs Action
          </Badge>
        )}
        <Button
          aria-label="Edit Destination"
          stableId={StableId.DESTINATIONS_SELECTOR_OPEN_EDIT_MODAL_BUTTON}
          size="s"
          color="transparent"
          onClick={() => openDestination(destination)}
        >
          <FeatherIcon icon="edit-2" size="xs" color="primary" />
        </Button>
      </Flex>
    </Card>
  );
}
