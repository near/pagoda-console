import type { Alerts } from '@pc/common/types/alerts';
import type { Api } from '@pc/common/types/api';
import { useState } from 'react';

import { Badge } from '@/components/lib/Badge';
import { Button } from '@/components/lib/Button';
import { Card } from '@/components/lib/Card';
import { FeatherIcon } from '@/components/lib/FeatherIcon';
import { Flex } from '@/components/lib/Flex';
import { Spinner } from '@/components/lib/Spinner';
import { Switch } from '@/components/lib/Switch';
import { Text } from '@/components/lib/Text';
import { useSureProjectContext } from '@/hooks/project-context';
import { useQuery } from '@/hooks/query';
import { destinationTypes } from '@/modules/alerts/utils/constants';
import { StableId } from '@/utils/stable-ids';

import { EditDestinationModal } from './EditDestinationModal';
import { NewDestinationModal } from './NewDestinationModal';

type Destination = Api.Query.Output<'/alerts/listDestinations'>[number];

interface Props {
  debounce?: boolean;
  onChange: (destinationId: Alerts.DestinationId, selected: boolean) => void;
  selectedIds: Alerts.DestinationId[];
}

export const DestinationsSelector = (props: Props) => {
  const { projectSlug } = useSureProjectContext();
  const destinationsQuery = useQuery(['/alerts/listDestinations', { projectSlug }]);
  const [showNewDestinationModal, setShowNewDestinationModal] = useState(false);
  const [showEditDestinationModal, setShowEditDestinationModal] = useState(false);
  const [selectedEditDestination, setSelectedEditDestination] =
    useState<Api.Query.Output<'/alerts/listDestinations'>[number]>();

  function openDestination(destination: Api.Query.Output<'/alerts/listDestinations'>[number]) {
    setSelectedEditDestination(destination);
    setShowEditDestinationModal(true);
  }

  return (
    <Flex stack>
      {destinationsQuery.status === 'loading' ? (
        <Spinner center />
      ) : destinationsQuery.status === 'error' ? (
        <div>Error while loading destinations</div>
      ) : destinationsQuery.data.length === 0 ? (
        <Text>{`Your selected project doesn't have any destinations configured yet.`}</Text>
      ) : (
        <Flex stack gap="s">
          {destinationsQuery.data.map((destination) => {
            return (
              <DestinationCard
                key={destination.id}
                destination={destination}
                openDestination={openDestination}
                debounce={props.debounce}
                checked={props.selectedIds.includes(destination.id)}
                onChange={(nextChecked) => props.onChange(destination.id, nextChecked)}
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
      )}

      <NewDestinationModal
        onCreate={(destination) => props.onChange(destination.id, true)}
        show={showNewDestinationModal}
        setShow={setShowNewDestinationModal}
      />

      {selectedEditDestination && (
        <EditDestinationModal
          destination={selectedEditDestination}
          show={showEditDestinationModal}
          setShow={setShowEditDestinationModal}
        />
      )}
    </Flex>
  );
};

type DestinationCardProps = Pick<Props, 'debounce'> & {
  checked: boolean;
  onChange: (nextChecked: boolean) => void;
  destination: Destination;
  openDestination: (destination: Destination) => void;
};

function DestinationCard({ destination, checked, debounce = true, openDestination, onChange }: DestinationCardProps) {
  const destinationType = destinationTypes[destination.type];

  return (
    <Card padding="m" borderRadius="m">
      <Flex align="center">
        <Switch
          stableId={StableId.DESTINATIONS_SELECTOR_SELECTED_SWITCH}
          checked={checked}
          onCheckedChange={onChange}
          debounce={debounce}
          aria-label={`Destination: ${destination.name}`}
          disabled={!destination.isValid}
        />
        <FeatherIcon icon={destinationType.icon} color={checked ? 'primary' : 'text3'} size="m" />
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
