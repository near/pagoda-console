import type { Api } from '@pc/common/types/api';
import * as Popover from '@radix-ui/react-popover';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { useRef, useState } from 'react';

import { Badge } from '@/components/lib/Badge';
import { Button } from '@/components/lib/Button';
import * as Dialog from '@/components/lib/Dialog';
import { FeatherIcon } from '@/components/lib/FeatherIcon';
import { Flex } from '@/components/lib/Flex';
import * as Table from '@/components/lib/Table';
import { Text } from '@/components/lib/Text';
import { useApiKeys } from '@/hooks/new-api-keys';
import JwtStarterGuide from '@/modules/apis/components/JwtStarterGuide';
import analytics from '@/utils/analytics';
import { StableId } from '@/utils/stable-ids';

import { UploadJwtForm } from './UploadJwtForm';

type Project = Api.Query.Output<'/projects/getDetails'>;
type ApiKeys = Api.Query.Output<'/projects/getKeys'>;

interface Props {
  project?: Project;
}

export function JwtAuth({ project }: Props) {
  const { keys: allKeys } = useApiKeys(project?.slug);
  const [showJwtModal, setShowJwtModal] = useState(false);

  const keys = allKeys?.filter((k) => k.type === 'JWT') || [];

  return (
    <Flex stack gap="l">
      <Button
        stableId={StableId.API_JWT_OPEN_CREATE_MODAL_BUTTON}
        css={{ alignSelf: 'flex-end' }}
        onClick={() => setShowJwtModal(true)}
      >
        Add Public Key
      </Button>
      <Flex stack>
        <Dialog.Root open={showJwtModal} onOpenChange={setShowJwtModal}>
          <Dialog.Content title="Add JWT Public Key" size="m">
            <UploadJwtForm setShow={setShowJwtModal} show={showJwtModal} project={project} />
          </Dialog.Content>
        </Dialog.Root>

        <KeysTable keys={keys}></KeysTable>
      </Flex>

      <JwtStarterGuide />
    </Flex>
  );
}

function KeysTable({ keys }: { keys: ApiKeys }) {
  if (!keys?.length) {
    return <></>;
  }
  return (
    <Table.Root>
      <Table.Head css={{ top: 0 }}>
        <Table.Row>
          <Table.HeaderCell>Public Key</Table.HeaderCell>
          <Table.HeaderCell>Description</Table.HeaderCell>
          <Table.HeaderCell></Table.HeaderCell>
        </Table.Row>
      </Table.Head>

      <Table.Body>
        {keys.map((apiKey, index) => {
          return (
            <Table.Row key={index}>
              <KeyRow publicKey={apiKey.key} description={apiKey.description} />
            </Table.Row>
          );
        })}
      </Table.Body>
    </Table.Root>
  );
}

function KeyRow(props: { publicKey: string; description: string }) {
  const [showCopiedAlert, setShowCopiedAlert] = useState(false);
  const copiedTimer = useRef<NodeJS.Timeout>();

  function copyKey() {
    if (copiedTimer.current) {
      clearTimeout(copiedTimer.current);
    }

    props.publicKey && navigator.clipboard.writeText(props.publicKey);

    analytics.track('DC Copy JWT Public Key', {
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
        <Badge size="s">
          {props.publicKey.substring(28, 38) +
            '...' +
            props.publicKey.substring(props.publicKey.length - 37, props.publicKey.length - 26)}
        </Badge>
      </Table.Cell>
      <Table.Cell css={{ maxWidth: '500px', whiteSpace: 'normal' }}>{props.description}</Table.Cell>
      <Table.Cell css={{ width: '1px' }}>
        <Flex>
          <Popover.Root open={showCopiedAlert} onOpenChange={setShowCopiedAlert}>
            <Popover.Anchor asChild>
              <Button
                stableId={StableId.API_JWT_COPY_KEY_BUTTON}
                size="s"
                color="neutral"
                onClick={copyKey}
                disabled={!props.publicKey}
              >
                <FeatherIcon icon="copy" size="xs" />
                <VisuallyHidden>Copy Public Key</VisuallyHidden>
              </Button>
            </Popover.Anchor>

            <Popover.Content side="top">
              <Text>Copied!</Text>
            </Popover.Content>
          </Popover.Root>
        </Flex>
      </Table.Cell>
    </>
  );
}
