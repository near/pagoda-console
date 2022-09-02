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
import { useApiKeys } from '@/hooks/new-api-keys';
import { ModalContent } from '@/modules/apis/components/CreateNewKeyForm';
import NewStarterGuide from '@/modules/core/components/NewStarterGuide';
import analytics from '@/utils/analytics';
import { authenticatedPost } from '@/utils/http';
import type { ApiKey, Project } from '@/utils/types';

const ROTATION_WARNING =
  'Are you sure you would like to rotate this API key? The current key will be invalidated and future calls made with it will be rejected.';

interface Props {
  project?: Project;
}

export function NewApiKeys({ project }: Props) {
  const { keys, mutate: mutateKeys } = useApiKeys(project?.slug);
  const [showRotationModal, setShowRotationModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [keyToRotate, setKeyToRotate] = useState<ApiKey>({ keySlug: '', description: '', key: '' });

  async function rotateKey(keySlug: string) {
    showRotationModal && setShowRotationModal(false);
    try {
      mutateKeys((cachedKeys) => {
        return cachedKeys?.map((key) => {
          if (key.keySlug === keySlug) {
            key.keySlug = '';
            key.key = '';
          }
          return key;
        });
      });
      await mutateKeys(async (cachedKeys) => {
        const { keySlug: newKeySlug, key: newKey }: { keySlug: string; key: string } = await authenticatedPost(
          '/projects/rotateKey',
          { slug: keySlug },
        );
        analytics.track('DC Rotate API Key', {
          status: 'success',
          description: keyToRotate.description,
        });
        return cachedKeys?.map((key: ApiKey) => {
          if (key.keySlug === keyToRotate.keySlug) {
            key.keySlug = newKeySlug;
            key.key = newKey;
          }
          return key;
        });
      });
    } catch (e: any) {
      analytics.track('DC Rotate API Key', {
        status: 'failure',
        description: keyToRotate.description,
        error: e.message,
      });
      throw new Error('Failed to rotate key');
    }
  }

  return (
    <Flex stack gap="l">
      <Button css={{ alignSelf: 'flex-end' }} onClick={() => setShowCreateModal(true)}>
        Create New Key
      </Button>
      <Flex stack>
        <Dialog.Root open={showCreateModal} onOpenChange={setShowCreateModal}>
          <Dialog.Content title="Create New Key" size="s">
            <ModalContent setShow={setShowCreateModal} show={showCreateModal} project={project} />
          </Dialog.Content>
        </Dialog.Root>
        <ConfirmModal
          confirmText="Rotate"
          onConfirm={() => rotateKey(keyToRotate.keySlug)}
          setShow={setShowRotationModal}
          show={showRotationModal}
          title="Rotate Key?"
        >
          <Text>{ROTATION_WARNING}</Text>
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

      <NewStarterGuide />
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

          <Button size="s" color="neutral" onClick={() => props.onClickRotateIcon()} disabled={!props.token}>
            Rotate
          </Button>
        </Flex>
      </Table.Cell>
    </>
  );
}
