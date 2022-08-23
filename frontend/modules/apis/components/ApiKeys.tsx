import { Root as VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { useRef, useState } from 'react';

import { Button } from '@/components/lib/Button';
import { Card } from '@/components/lib/Card';
import { FeatherIcon } from '@/components/lib/FeatherIcon';
import { Flex } from '@/components/lib/Flex';
import { H1, H5 } from '@/components/lib/Heading';
import { Placeholder } from '@/components/lib/Placeholder';
import * as Popover from '@/components/lib/Popover';
import { SubnetIcon } from '@/components/lib/SubnetIcon';
import { Text } from '@/components/lib/Text';
import { ConfirmModal } from '@/components/modals/ConfirmModal';
import { useApiKeys } from '@/hooks/api-keys';
import StarterGuide from '@/modules/core/components/StarterGuide';
import analytics from '@/utils/analytics';
import { authenticatedPost } from '@/utils/http';
import type { NetOption, Project } from '@/utils/types';

const ROTATION_WARNING =
  'Are you sure you would like to rotate this API key? The current key will be invalidated and future calls made with it will be rejected.';

interface Props {
  project?: Project;
}

export function ApiKeys({ project }: Props) {
  const { keys, mutate: mutateKeys } = useApiKeys(project?.slug);
  const [showMainnetRotationModal, setShowMainnetRotationModal] = useState(false);
  const [showTestnetRotationModal, setShowTestnetRotationModal] = useState(false);

  // Tutorial projects do not have MAINNET keys.
  const hasMainnetKey = !project?.tutorial;

  async function rotateKey(net: NetOption) {
    showMainnetRotationModal && setShowMainnetRotationModal(false);
    showTestnetRotationModal && setShowTestnetRotationModal(false);

    const subId = net === 'MAINNET' ? 2 : 1;

    try {
      // clear current key from the UI
      mutateKeys((cachedKeys) => {
        const clone = {
          ...cachedKeys,
        };
        delete clone[net];
        return clone;
      });

      await mutateKeys(async (cachedKeys) => {
        const newKey = await authenticatedPost('/projects/rotateKey', { project: project?.slug, environment: subId });

        analytics.track('DC Rotate API Key', {
          status: 'success',
          net: net,
        });

        return {
          ...cachedKeys,
          ...newKey,
        };
      });
    } catch (e: any) {
      analytics.track('DC Rotate API Key', {
        status: 'failure',
        net: net,
        error: e.message,
      });
      // refetch just in case we cleared the old key from the UI but it was not actually rotated
      mutateKeys();
      // TODO log error
      throw new Error('Failed to rotate key');
    }
  }

  return (
    <Flex stack gap="l">
      <H1>API Keys</H1>

      <Flex stack>
        {hasMainnetKey && (
          <>
            <ConfirmModal
              confirmText="Rotate"
              onConfirm={() => rotateKey('MAINNET')}
              setShow={setShowMainnetRotationModal}
              show={showMainnetRotationModal}
              title="Rotate Mainnet Key?"
            >
              <Text>{ROTATION_WARNING}</Text>
            </ConfirmModal>

            <KeyRow
              name="Mainnet"
              net="MAINNET"
              token={keys?.MAINNET}
              onRotateKey={() => setShowMainnetRotationModal(true)}
            />
          </>
        )}

        <ConfirmModal
          confirmText="Rotate"
          onConfirm={() => rotateKey('TESTNET')}
          setShow={setShowTestnetRotationModal}
          show={showTestnetRotationModal}
          title="Rotate Testnet Key?"
        >
          <Text>{ROTATION_WARNING}</Text>
        </ConfirmModal>

        <KeyRow
          name="Testnet"
          net="TESTNET"
          token={keys?.TESTNET}
          onRotateKey={() => setShowTestnetRotationModal(true)}
        />
      </Flex>

      <StarterGuide />
    </Flex>
  );
}

function KeyRow(props: { name: string; net: NetOption; token?: string; onRotateKey: () => void }) {
  const [keyObscured, setKeyObscured] = useState(true);
  const [showCopiedAlert, setShowCopiedAlert] = useState(false);
  const copiedTimer = useRef<NodeJS.Timeout>();

  function getObscuredKey(key: string) {
    return key.substring(0, 8) + `-••••-••••-••••-••••••••••••`;
  }

  function copyKey() {
    if (copiedTimer.current) {
      clearTimeout(copiedTimer.current);
    }

    props.token && navigator.clipboard.writeText(props.token);

    analytics.track('DC Copy API Key', {
      net: props.name,
    });

    setShowCopiedAlert(true);

    copiedTimer.current = setTimeout(() => {
      setShowCopiedAlert(false);
    }, 2000);
  }

  return (
    <Card padding="m" borderRadius="m">
      <Flex align="center" justify="spaceBetween">
        <Flex align="center" gap="l">
          <Flex align="center" autoWidth>
            <SubnetIcon net={props.net} />

            <H5 css={{ width: '5rem' }}>{props.name}</H5>
          </Flex>

          <Text family="number" color="text1">
            {props.token ? (
              keyObscured ? (
                getObscuredKey(props.token)
              ) : (
                props.token
              )
            ) : (
              <Placeholder css={{ width: '10rem', height: '1rem' }} />
            )}
          </Text>
        </Flex>

        <Button size="s" color="neutral" onClick={() => setKeyObscured(!keyObscured)} disabled={!props.token}>
          <FeatherIcon icon={keyObscured ? 'eye-off' : 'eye'} size="xs" />
          <VisuallyHidden>{keyObscured ? 'Reveal' : 'Obscure'} API Key</VisuallyHidden>
        </Button>

        <Popover.Root open={showCopiedAlert} onOpenChange={setShowCopiedAlert}>
          <Popover.Anchor asChild>
            <Button size="s" color="neutral" onClick={copyKey} disabled={!props.token}>
              <FeatherIcon icon="copy" size="xs" />
              <VisuallyHidden>Copy API Key</VisuallyHidden>
            </Button>
          </Popover.Anchor>

          <Popover.Content side="top">
            <Text>Copied!</Text>
          </Popover.Content>
        </Popover.Root>

        <Button size="s" color="neutral" onClick={() => props.onRotateKey()} disabled={!props.token}>
          Rotate
        </Button>
      </Flex>
    </Card>
  );
}
