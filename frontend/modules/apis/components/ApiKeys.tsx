import type { Api } from '@pc/common/types/api';
import { Root as VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { useRef, useState } from 'react';

import { Badge } from '@/components/lib/Badge';
import { Button } from '@/components/lib/Button';
import * as Dialog from '@/components/lib/Dialog';
import { FeatherIcon } from '@/components/lib/FeatherIcon';
import { Flex } from '@/components/lib/Flex';
import { Placeholder } from '@/components/lib/Placeholder';
import * as Popover from '@/components/lib/Popover';
import * as Table from '@/components/lib/Table';
import { Text } from '@/components/lib/Text';
import { ConfirmModal } from '@/components/modals/ConfirmModal';
import { useApiKeys } from '@/hooks/api-keys';
import { useTypedMutation } from '@/hooks/typed-mutation';
import { CreateApiKeyForm } from '@/modules/apis/components/CreateApiKeyForm';
import StarterGuide from '@/modules/core/components/StarterGuide';
import analytics from '@/utils/analytics';
import { handleMutationError } from '@/utils/error-handlers';
import { StableId } from '@/utils/stable-ids';

type Project = Api.Query.Output<'/projects/getDetails'>;
type ApiKey = Api.Query.Output<'/projects/getKeys'>[number];

interface Props {
  project?: Project;
}

export function ApiKeys({ project }: Props) {
  const { keys, mutate: mutateKeys } = useApiKeys(project?.slug);
  const [showRotationModal, setShowRotationModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [keyToRotate, setKeyToRotate] = useState<ApiKey>({
    keySlug: '',
    description: '',
    key: '',
  });

  const rotateKeyMutation = useTypedMutation('/projects/rotateKey', {
    onSuccess: () => {
      mutateKeys();
      setShowRotationModal(false);
      analytics.track('DC Rotate API Key', {
        status: 'success',
      });
    },
    onError: (error) => {
      handleMutationError({
        error,
        eventLabel: 'DC Rotate API Key',
        toastTitle: 'Failed to rotate API key.',
      });
    },
  });

  return (
    <Flex stack gap="l">
      <Button
        stableId={StableId.API_KEYS_OPEN_CREATE_MODAL_BUTTON}
        css={{ alignSelf: 'flex-end' }}
        onClick={() => setShowCreateModal(true)}
      >
        Create New Key
      </Button>

      <Flex stack>
        <Dialog.Root open={showCreateModal} onOpenChange={setShowCreateModal}>
          <Dialog.Content title="Create New Key" size="s">
            <CreateApiKeyForm project={project} onClose={() => setShowCreateModal(false)} />
          </Dialog.Content>
        </Dialog.Root>

        <ConfirmModal
          confirmText="Rotate"
          isProcessing={rotateKeyMutation.isLoading}
          onConfirm={() => rotateKeyMutation.mutate({ slug: keyToRotate.keySlug })}
          setShow={setShowRotationModal}
          show={showRotationModal}
          title="Rotate Key?"
        >
          <Text>
            Are you sure you would like to rotate this API key? The current key will be invalidated and future calls
            made with it will be rejected.
          </Text>
        </ConfirmModal>

        <Table.Root>
          <Table.Head css={{ top: 0 }}>
            <Table.Row>
              <Table.HeaderCell>Key</Table.HeaderCell>
              <Table.HeaderCell>Description</Table.HeaderCell>
              <Table.HeaderCell></Table.HeaderCell>
            </Table.Row>
          </Table.Head>

          <Table.Body>
            {keys &&
              keys.map((apiKey, index) => {
                return (
                  <Table.Row key={index}>
                    <KeyRow
                      token={apiKey?.key}
                      description={apiKey?.description}
                      onClickRotateIcon={() => {
                        setKeyToRotate(apiKey);
                        setShowRotationModal(true);
                      }}
                    />
                  </Table.Row>
                );
              })}
          </Table.Body>
        </Table.Root>
      </Flex>

      <StarterGuide />
    </Flex>
  );
}

function KeyRow(props: { token?: string; description: string; onClickRotateIcon: () => void }) {
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
      status: 'success',
      description: props.description,
    });

    setShowCopiedAlert(true);

    copiedTimer.current = setTimeout(() => {
      setShowCopiedAlert(false);
    }, 2000);
  }

  return (
    <>
      <Table.Cell css={{ width: '400px' }}>
        {props.token ? (
          <Badge size="s">{keyObscured ? getObscuredKey(props.token) : props.token}</Badge>
        ) : (
          <Placeholder css={{ width: '10rem', height: '1rem' }} />
        )}
      </Table.Cell>
      <Table.Cell css={{ maxWidth: '500px', whiteSpace: 'normal' }}>{props.description}</Table.Cell>
      <Table.Cell css={{ width: '1px' }}>
        <Flex>
          <Button
            stableId={StableId.API_KEYS_REVEAL_KEY_TOGGLE_BUTTON}
            size="s"
            color="neutral"
            onClick={() => setKeyObscured(!keyObscured)}
            disabled={!props.token}
          >
            <FeatherIcon icon={keyObscured ? 'eye-off' : 'eye'} size="xs" />
            <VisuallyHidden>{keyObscured ? 'Reveal' : 'Obscure'} API Key</VisuallyHidden>
          </Button>

          <Popover.Root open={showCopiedAlert} onOpenChange={setShowCopiedAlert}>
            <Popover.Anchor asChild>
              <Button
                stableId={StableId.API_KEYS_COPY_KEY_BUTTON}
                size="s"
                color="neutral"
                onClick={copyKey}
                disabled={!props.token}
              >
                <FeatherIcon icon="copy" size="xs" />
                <VisuallyHidden>Copy API Key</VisuallyHidden>
              </Button>
            </Popover.Anchor>

            <Popover.Content side="top">
              <Text>Copied!</Text>
            </Popover.Content>
          </Popover.Root>

          <Button
            stableId={StableId.API_KEYS_OPEN_ROTATE_MODAL_BUTTON}
            size="s"
            color="neutral"
            onClick={() => props.onClickRotateIcon()}
            disabled={!props.token}
          >
            Rotate
          </Button>
        </Flex>
      </Table.Cell>
    </>
  );
}
