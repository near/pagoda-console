import type { Api } from '@pc/common/types/api';
import { useEffect, useState } from 'react';

import { Card } from '@/components/lib/Card';
import { FeatherIcon } from '@/components/lib/FeatherIcon';
import { Flex } from '@/components/lib/Flex';
import { H5 } from '@/components/lib/Heading';
import { List, ListItem } from '@/components/lib/List';
import { Text } from '@/components/lib/Text';
import { ConfirmModal } from '@/components/modals/ConfirmModal';
import { useApiMutation } from '@/hooks/api-mutation';
import { useSelectedProject } from '@/hooks/selected-project';
import analytics from '@/utils/analytics';
import { handleMutationError } from '@/utils/error-handlers';

import { useAlerts } from '../hooks/alerts';

type Destination = Api.Query.Output<'/alerts/listDestinations'>[number];
type Alerts = Api.Query.Output<'/alerts/listAlerts'>;

interface Props {
  destination: Destination;
  show: boolean;
  setShow: (show: boolean) => void;
  onDelete: () => void;
}

export function DeleteDestinationModal({ destination, show, setShow, onDelete }: Props) {
  const [errorText, setErrorText] = useState<string | undefined>();
  const { environment, project } = useSelectedProject();
  const { alerts } = useAlerts(project?.slug, environment?.subId);
  const [enabledAlerts, setEnabledAlerts] = useState<Alerts>([]);

  const deleteDestinationMutation = useApiMutation('/alerts/deleteDestination', {
    onMutate: () => {
      setErrorText('');
    },

    onSuccess: () => {
      analytics.track('DC Remove Destination', {
        status: 'success',
        name: destination.name,
        id: destination.id,
      });
      onDelete();
      setShow(false);
    },

    onError: (error) => {
      setErrorText('Failed to delete destination.');
      handleMutationError({
        error,
        eventLabel: 'DC Remove Destination',
        eventData: {
          name: destination.name,
          id: destination.id,
        },
      });
    },
  });

  useEffect(() => {
    const result = alerts?.filter((alert) => {
      const enabledDestination = alert.enabledDestinations.find((d) => d.id === destination.id);
      return !!enabledDestination;
    });

    setEnabledAlerts(result || []);
  }, [alerts, destination]);

  function onConfirm() {
    deleteDestinationMutation.mutate({
      id: destination.id,
    });
  }

  return (
    <ConfirmModal
      confirmColor="danger"
      confirmText="Delete"
      errorText={errorText}
      isProcessing={deleteDestinationMutation.isLoading}
      onConfirm={onConfirm}
      resetError={() => setErrorText('')}
      setShow={setShow}
      show={show}
      title={`Delete Destination`}
    >
      <Flex stack>
        <Text>
          This action cannot be undone. Are you sure you want to delete{' '}
          <Text color="text1" weight="semibold" as="span">
            {destination.name}
          </Text>
          ?
        </Text>
      </Flex>

      <Card padding="m" borderRadius="m">
        {enabledAlerts.length === 0 ? (
          <Flex stack>
            <Flex align="center">
              <FeatherIcon color="success" icon="check-circle" />
              <H5>No Affected Alerts</H5>
            </Flex>
            <Text>This destination isn&apos;t enabled on any alerts.</Text>
          </Flex>
        ) : (
          <Flex stack>
            <Flex align="center">
              <FeatherIcon color="danger" icon="alert-triangle" />
              <H5>
                {enabledAlerts.length} Affected Alert{enabledAlerts.length !== 1 && 's'}
              </H5>
            </Flex>
            <Text>This destination will be removed from the following alert{enabledAlerts.length !== 1 && 's'}:</Text>
            <List>
              {enabledAlerts.map((alert) => {
                return (
                  <ListItem key={alert.id}>
                    <Text color="text1" weight="semibold">
                      {alert.name}
                    </Text>
                  </ListItem>
                );
              })}
            </List>
          </Flex>
        )}
      </Card>
    </ConfirmModal>
  );
}
