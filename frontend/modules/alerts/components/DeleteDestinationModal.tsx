import { useEffect, useState } from 'react';

import { Card } from '@/components/lib/Card';
import { FeatherIcon } from '@/components/lib/FeatherIcon';
import { Flex } from '@/components/lib/Flex';
import { H5 } from '@/components/lib/Heading';
import { List, ListItem } from '@/components/lib/List';
import { Text } from '@/components/lib/Text';
import { ConfirmModal } from '@/components/modals/ConfirmModal';
import { useSelectedProject } from '@/hooks/selected-project';

import { useAlerts } from '../hooks/alerts';
import { deleteDestination } from '../hooks/destinations';
import type { Alert, Destination } from '../utils/types';

interface Props {
  destination: Destination;
  show: boolean;
  setShow: (show: boolean) => void;
  onDelete: () => void;
}

export function DeleteDestinationModal({ destination, show, setShow, onDelete }: Props) {
  const [errorText, setErrorText] = useState<string | undefined>();
  const [isDeleting, setIsDeleting] = useState(false);
  const { environment, project } = useSelectedProject();
  const { alerts } = useAlerts(project?.slug, environment?.subId);
  const [enabledAlerts, setEnabledAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    const result = alerts?.filter((alert) => {
      const enabledDestination = alert.enabledDestinations.find((d) => d.id === destination.id);
      return !!enabledDestination;
    });

    setEnabledAlerts(result || []);
  }, [alerts, destination]);

  async function onConfirm() {
    setIsDeleting(true);
    setErrorText('');

    const success = await deleteDestination(destination);

    if (success) {
      onDelete();
      setShow(false);
    } else {
      setErrorText('Something went wrong.');
      setIsDeleting(false);
    }
  }

  return (
    <ConfirmModal
      confirmColor="danger"
      confirmText="Delete"
      errorText={errorText}
      isProcessing={isDeleting}
      onConfirm={onConfirm}
      setErrorText={setErrorText}
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
              <H5>Affected Alerts</H5>
            </Flex>
            <Text>This destination will be removed from the following alerts:</Text>
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
