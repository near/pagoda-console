import type { ChangeEvent } from 'react';
import { useCallback, useState } from 'react';

import { Button, ButtonLabel, ButtonLink } from '@/components/lib/Button';
import { Card } from '@/components/lib/Card';
import { CodeBlock } from '@/components/lib/CodeBlock';
import { FeatherIcon } from '@/components/lib/FeatherIcon';
import { Flex } from '@/components/lib/Flex';
import * as Form from '@/components/lib/Form';
import { Text } from '@/components/lib/Text';
import { TextLink } from '@/components/lib/TextLink';
import { openToast } from '@/components/lib/Toast';
import { ConfirmModal } from '@/components/modals/ConfirmModal';
import { uploadContractAbi } from '@/modules/contracts/hooks/abi';

const MAX_CODE_HEIGHT = '18rem';

type Props = {
  contractSlug: string;
  setAbiUploaded: (arg0: boolean) => void;
};

export const UploadContractAbi = ({ contractSlug, setAbiUploaded }: Props) => {
  const [showModal, setShowModal] = useState(true);
  const [previewAbi, setPreviewAbi] = useState<string | null>(null);

  async function uploadAbi() {
    if (!previewAbi) {
      // TODO this should be implemented as form validation error message instead.
      openToast({
        type: 'error',
        title: 'Error on Contract ABI Upload',
        description: `${contractSlug}`,
      });
      return null;
    }
    const uploaded = await uploadContractAbi(contractSlug, JSON.parse(previewAbi));
    if (uploaded) {
      setAbiUploaded(true);
      setShowModal(false);
      openToast({
        type: 'success',
        title: 'ABI Uploaded.',
      });
    } else {
      openToast({
        type: 'error',
        title: 'Failed to upload ABI.',
      });
    }
  }

  const handleUpload = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();

    if (!e.target.files?.[0]) {
      return null;
    }

    fileReader.readAsText(e.target.files[0], 'UTF-8');
    fileReader.onload = (e) => {
      if (e && e.target && e.target.result) {
        const content = e.target.result as any;
        try {
          JSON.parse(content);
          setPreviewAbi(content);
        } catch {
          openToast({
            type: 'error',
            title: 'Error parsing ABI',
            description: 'Please ensure file is in JSON format.',
          });
          return null;
        }
      } else {
        openToast({
          type: 'error',
          title: 'Error on Contract ABI Upload',
        });
        return null;
      }
    };
  }, []);

  // TODO break out modal and default state into separate components. That should help with clearing the form data in the modal.

  return (
    <>
      <Card>
        <Flex stack align="center">
          <FeatherIcon icon="file-text" size="l" />
          <Text>To start interacting with your contract you need to upload ABI first.</Text>
          <Flex justify="center">
            <Button onClick={() => setShowModal(true)} color="primaryBorder">
              Upload ABI
            </Button>
            <ButtonLink href="https://github.com/near/abi" external>
              Near ABI
            </ButtonLink>
          </Flex>
        </Flex>
      </Card>

      <ConfirmModal
        confirmColor="primary"
        onConfirm={uploadAbi}
        setShow={setShowModal}
        show={showModal}
        title={`Before you start, add an ABI`}
        size="m"
        disabled={!previewAbi}
      >
        <Flex inline justify="spaceBetween">
          <TextLink href="https://github.com/near/abi" external>
            To generate an ABI
          </TextLink>

          <ButtonLabel color="primaryBorder" size="s">
            <FeatherIcon size="xs" icon="upload" />
            Upload
            <Form.Input type="file" onChange={handleUpload} file tabIndex={-1} accept="application/JSON" />
          </ButtonLabel>
        </Flex>

        <CodeBlock css={{ maxHeight: MAX_CODE_HEIGHT }} language="json">
          {!previewAbi ? '{}' : JSON.stringify(JSON.parse(previewAbi), null, 2)}
        </CodeBlock>
      </ConfirmModal>
    </>
  );
};
