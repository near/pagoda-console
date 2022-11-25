import type { Api } from '@pc/common/types/api';
import { useCallback, useMemo } from 'react';
import { mutate } from 'swr';

import { Card } from '@/components/lib/Card';
import { FeatherIcon } from '@/components/lib/FeatherIcon';
import { Flex } from '@/components/lib/Flex';
import { H5 } from '@/components/lib/Heading';
import { List, ListItem } from '@/components/lib/List';
import { Text } from '@/components/lib/Text';
import { ConfirmModal } from '@/components/modals/ConfirmModal';
import { useAuth } from '@/hooks/auth';
import { useMutation } from '@/hooks/mutation';
import { useSureProjectContext } from '@/hooks/project-context';

import { useAlerts } from '../hooks/alerts';

type Destination = Api.Query.Output<'/alerts/listDestinations'>[number];

interface Props {
  destination: Destination;
  show: boolean;
  setShow: (show: boolean) => void;
  onDelete: () => void;
}

export function DeleteDestinationModal({ destination, show, setShow, onDelete }: Props) {
  const { identity } = useAuth();
  const { projectSlug, environmentSubId } = useSureProjectContext();
  const { alerts } = useAlerts(projectSlug, environmentSubId);
  const deleteDestinationMutation = useMutation('/alerts/deleteDestination', {
    onSuccess: (_result, variables) => {
      mutate(['/alerts/listDestinations', projectSlug, identity?.uid], (prev) => {
        if (!prev) {
          return;
        }
        return prev.filter((destination) => destination.id !== variables.id);
      });
      setShow(false);
      onDelete();
    },
    getAnalyticsSuccessData: (variables) => ({ name: variables.id }),
    getAnalyticsErrorData: (variables) => ({ name: variables.id }),
  });
  const enabledAlerts = useMemo(
    () =>
      alerts?.filter((alert) =>
        alert.enabledDestinations.some((lookupDestination) => destination.id === lookupDestination.id),
      ) ?? [],
    [alerts, destination.id],
  );

  const onConfirm = useCallback(
    () => deleteDestinationMutation.mutate({ id: destination.id }),
    [deleteDestinationMutation, destination.id],
  );

  return (
    <ConfirmModal
      confirmColor="danger"
      confirmText="Delete"
      errorText={deleteDestinationMutation.status === 'error' ? 'Something went wrong' : undefined}
      isProcessing={deleteDestinationMutation.isLoading}
      onConfirm={onConfirm}
      resetError={deleteDestinationMutation.reset}
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
