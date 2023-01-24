import type { Api } from '@pc/common/types/api';
import { useState } from 'react';

import { Button } from '@/components/lib/Button';
import { Card } from '@/components/lib/Card';
import { CopyButton } from '@/components/lib/CopyButton';
import { Flex } from '@/components/lib/Flex';
import { Text } from '@/components/lib/Text';
import { ConfirmModal } from '@/components/modals/ConfirmModal';
import { useApiMutation } from '@/hooks/api-mutation';
import analytics from '@/utils/analytics';
import { handleMutationError } from '@/utils/error-handlers';
import { StableId } from '@/utils/stable-ids';

type Destination = Api.Query.Output<'/alerts/listDestinations'>[number];

interface Props {
  destination: Destination;
  onRotate?: (d: Destination) => void;
}

export function WebhookDestinationSecret({ destination, onRotate }: Props) {
  if (destination.type !== 'WEBHOOK') throw new Error('Invalid destination for WebhookDestinationSecret');

  const [errorText, setErrorText] = useState<string | undefined>();
  const [showRotateConfirmModal, setShowRotateConfirmModal] = useState(false);
  const authorizationHeader = `Bearer ${destination.config.secret}`;

  const rotateSecretMutation = useApiMutation('/alerts/rotateWebhookDestinationSecret', {
    onMutate: () => {
      setErrorText('');
    },

    onSuccess: (result) => {
      analytics.track('DC Rotate Webhook Destination Secret', {
        status: 'success',
        id: destination.id,
      });

      onRotate?.(result);

      setShowRotateConfirmModal(false);
    },

    onError: (error) => {
      setErrorText('Failed to rotate webhook secret.');
      handleMutationError({
        error,
        eventLabel: 'DC Rotate Webhook Destination Secret',
      });
    },
  });

  function rotateSecret() {
    rotateSecretMutation.mutate({
      destinationId: destination.id,
    });
  }

  return (
    <>
      <Flex stack>
        <Text>
          When we send data to this webhook, we&apos;ll include the following secret in our headers so that you know
          it&apos;s us:
        </Text>

        <Card padding="m" borderRadius="m" border>
          <Flex justify="stretch" align="center" wrap>
            <Text family="code">Authorization:</Text>
            <Text family="code" color="text1" weight="semibold" css={{ flexGrow: 1 }}>
              {authorizationHeader}
            </Text>
            <CopyButton stableId={StableId.WEBHOOK_DESTINATION_SECRET_COPY_SECRET_BUTTON} value={authorizationHeader} />
            {onRotate && (
              <Button
                stableId={StableId.WEBHOOK_DESTINATION_SECRET_ROTATE_SECRET_BUTTON}
                color="neutral"
                onClick={() => setShowRotateConfirmModal(true)}
                size="s"
              >
                Rotate
              </Button>
            )}
          </Flex>
        </Card>
      </Flex>

      <ConfirmModal
        onConfirm={rotateSecret}
        setShow={setShowRotateConfirmModal}
        show={showRotateConfirmModal}
        errorText={errorText}
        resetError={() => setErrorText('')}
        title="Rotate Secret"
        isProcessing={rotateSecretMutation.isLoading}
      >
        <Text>Are you sure you would like to rotate this webhook secret? The current secret will be invalidated.</Text>
      </ConfirmModal>
    </>
  );
}
