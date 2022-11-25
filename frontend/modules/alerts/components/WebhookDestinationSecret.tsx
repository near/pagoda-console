import type { Api } from '@pc/common/types/api';
import { useCallback, useState } from 'react';

import { Button } from '@/components/lib/Button';
import { Card } from '@/components/lib/Card';
import { CopyButton } from '@/components/lib/CopyButton';
import { Flex } from '@/components/lib/Flex';
import { Text } from '@/components/lib/Text';
import { openToast } from '@/components/lib/Toast';
import { ConfirmModal } from '@/components/modals/ConfirmModal';
import { useMutation } from '@/hooks/mutation';
import { useSureProjectContext } from '@/hooks/project-context';
import { StableId } from '@/utils/stable-ids';
import type { MapDiscriminatedUnion } from '@/utils/types';

import { useDestinations } from '../hooks/destinations';

type WebhookDestination = MapDiscriminatedUnion<
  Api.Query.Output<'/alerts/listDestinations'>[number],
  'type'
>['WEBHOOK'];

interface Props {
  destination: WebhookDestination;
  viaConfirm?: boolean;
}

const ROTATION_WARNING =
  'Are you sure you would like to rotate this webhook secret? The current secret will be invalidated.';

export function WebhookDestinationSecret({ destination, viaConfirm }: Props) {
  const { projectSlug } = useSureProjectContext();
  const { mutate } = useDestinations(projectSlug);
  const [showRotateConfirmModal, setShowRotateConfirmModal] = useState(false);
  const rotateWebhookDestinationSecretMutation = useMutation('/alerts/rotateWebhookDestinationSecret', {
    onSuccess: (result) => {
      mutate((destinations) => {
        if (!destinations) {
          return;
        }
        return destinations.map((lookupDestination) => {
          if (lookupDestination.id !== destination.id) {
            return lookupDestination;
          }
          const webhookDestination = lookupDestination as WebhookDestination;
          return { ...webhookDestination, config: { ...webhookDestination.config, secret: result.config.secret } };
        });
      });
      openToast({
        type: 'success',
        title: 'Webhook secret was rotated.',
      });
    },
    onError: () => {
      openToast({
        type: 'error',
        title: 'Failed to rotate webhook secret.',
      });
    },
    onSettled: () => setShowRotateConfirmModal(false),
    getAnalyticsSuccessData: ({ destinationId }) => ({ id: destinationId }),
  });

  const rotate = useCallback(
    () => rotateWebhookDestinationSecretMutation.mutate({ destinationId: destination.id }),
    [rotateWebhookDestinationSecretMutation, destination.id],
  );

  if (destination.type !== 'WEBHOOK') return null;

  const authorizationHeader = `Bearer ${destination.config.secret}`;

  return (
    <>
      <Flex stack>
        <Text>
          When we send data to this webhook, we&apos;ll include the following secret in our headers so that you know
          it&apos;s us:
        </Text>

        <Card padding="m" borderRadius="m" border>
          <Flex justify="stretch" align="center">
            <Text family="code">Authorization:</Text>
            <Text family="code" color="text1" weight="semibold">
              {authorizationHeader}
            </Text>
            <CopyButton
              stableId={StableId.WEBHOOK_DESTINATION_SECRET_COPY_SECRET_BUTTON}
              value={authorizationHeader}
              css={{ marginLeft: 'auto' }}
              color="transparent"
            />
            {viaConfirm ? (
              <Button
                stableId={StableId.WEBHOOK_DESTINATION_SECRET_ROTATE_SECRET_BUTTON}
                color="neutral"
                loading={rotateWebhookDestinationSecretMutation.isLoading}
                onClick={() => setShowRotateConfirmModal(true)}
              >
                Rotate
              </Button>
            ) : null}
          </Flex>
        </Card>
      </Flex>
      <ConfirmModal
        onConfirm={rotate}
        setShow={setShowRotateConfirmModal}
        show={showRotateConfirmModal}
        title="Rotate secret"
      >
        <Text>{ROTATION_WARNING}</Text>
      </ConfirmModal>
    </>
  );
}
