import type { Api } from '@pc/common/types/api';
import { useCallback, useEffect, useState } from 'react';

import { Card } from '@/components/lib/Card';
import { FeatherIcon } from '@/components/lib/FeatherIcon';
import { Flex } from '@/components/lib/Flex';
import { H5 } from '@/components/lib/Heading';
import { List, ListItem } from '@/components/lib/List';
import { Text } from '@/components/lib/Text';
import { ConfirmModal } from '@/components/modals/ConfirmModal';
import { useSureProjectContext } from '@/hooks/project-context';

import { useAlerts } from '../hooks/alerts';
import { deleteDestination } from '../hooks/destinations';

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
  const [isDeleting, setIsDeleting] = useState(false);
  const { environmentSubId, projectSlug } = useSureProjectContext();
  const { alerts } = useAlerts(projectSlug, environmentSubId);
  const [enabledAlerts, setEnabledAlerts] = useState<Alerts>([]);

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
  const resetError = useCallback(() => setErrorText(''), [setErrorText]);

  return (
    <ConfirmModal
      confirmColor="danger"
      confirmText="Delete"
      errorText={errorText}
      isProcessing={isDeleting}
      onConfirm={onConfirm}
      resetError={resetError}
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
