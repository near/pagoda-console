import { useState } from 'react';

import { Button } from '@/components/lib/Button';
import { Card } from '@/components/lib/Card';
import { CopyButton } from '@/components/lib/CopyButton';
import { Flex } from '@/components/lib/Flex';
import { Text } from '@/components/lib/Text';
import { openToast } from '@/components/lib/Toast';
import { ConfirmModal } from '@/components/modals/ConfirmModal';

import { rotateWebhookDestinationSecret } from '../hooks/destinations';
import type { Destination } from '../utils/types';

interface Props {
  destination: Destination;
  onRotate?: (d: Destination) => void;
}

const ROTATION_WARNING =
  'Are you sure you would like to rotate this webhook secret? The current secret will be invalidated.';

export function WebhookDestinationSecret({ destination, onRotate }: Props) {
  const [isSending, setIsSending] = useState(false);
  const [showRotateConfirmModal, setShowRotateConfirmModal] = useState(false);

  if (destination.type !== 'WEBHOOK') return null;

  const authorizationHeader = `Bearer ${destination.config.secret}`;

  async function rotateSecret() {
    if (destination.type !== 'WEBHOOK') return;
    if (!onRotate) return;

    try {
      setIsSending(true);
      const res = await rotateWebhookDestinationSecret(destination.id);
      if (res.type !== 'WEBHOOK') return;

      const updated = {
        ...destination,
      };
      updated.config.secret = res.config.secret;

      onRotate(updated);
    } catch (e) {
      console.error('Failed to rotate webhook secret.', e);
      openToast({
        type: 'error',
        title: 'Failed to rotate webhook secret.',
      });
    } finally {
      setIsSending(false);
      setShowRotateConfirmModal(false);
    }
  }

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
            <CopyButton value={authorizationHeader} css={{ marginLeft: 'auto' }} color="transparent" />
            {onRotate && (
              <Button color="neutral" loading={isSending} onClick={() => setShowRotateConfirmModal(true)}>
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
        title="Rotate secret"
      >
        <Text>{ROTATION_WARNING}</Text>
      </ConfirmModal>
    </>
  );
}
