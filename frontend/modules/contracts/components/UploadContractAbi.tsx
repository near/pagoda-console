import { useCallback, useState } from 'react';

import { Box } from '@/components/lib/Box';
import { Button, ButtonLink } from '@/components/lib/Button';
import { Card } from '@/components/lib/Card';
import { CodeBlock } from '@/components/lib/CodeBlock';
import { FeatherIcon } from '@/components/lib/FeatherIcon';
import { Flex } from '@/components/lib/Flex';
import * as Form from '@/components/lib/Form';
import { Text } from '@/components/lib/Text';
import { openToast } from '@/components/lib/Toast';
import { ConfirmModal } from '@/components/modals/ConfirmModal';
import { uploadContractAbi } from '@/modules/contracts/hooks/abi';
import { styled } from '@/styles/stitches';

const MAX_CODE_HEIGHT = '18rem';

const Upload = styled('div', {
  position: 'relative',
  overflow: 'hidden',

  [`& ${Text}`]: {
    color: 'var(--color-primary)',
  },

  '& input[type=file]': {
    position: 'absolute',
    left: 0,
    top: 0,
    opacity: 0,
  },
});

const CodeWrapper = styled(Box, {
  marginTop: '1.5rem',
  maxHeight: MAX_CODE_HEIGHT,
});

type Props = {
  contractSlug: string;
  setAbiUploaded: (arg0: boolean) => void;
};

export const UploadContractAbi = ({ contractSlug, setAbiUploaded }: Props) => {
  const [showModal, setShowModal] = useState(true);
  const [previewAbi, setPreviewAbi] = useState<string | null>(null);

  async function uploadAbi() {
    if (!previewAbi) {
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
        title: 'Contract ABI Uploaded',
        description: `${contractSlug}`,
      });
    } else {
      openToast({
        type: 'error',
        title: 'Error on Contract ABI Upload',
        description: `${contractSlug}`,
      });
    }
  }

  const handleUpload = useCallback((e) => {
    const fileReader = new FileReader();

    if (!e.target.files[0]) {
      return null;
    }

    fileReader.readAsText(e.target.files[0], 'UTF-8');
    fileReader.onload = (e) => {
      if (e && e.target && e.target.result) {
        setPreviewAbi(e.target.result as any);
      } else {
        openToast({
          type: 'error',
          title: 'Error on Contract ABI Upload',
        });
        return null;
      }
    };
  }, []);

  if (!showModal) {
    return (
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
    );
  }

  return (
    <ConfirmModal
      confirmColor="primary"
      onConfirm={uploadAbi}
      setShow={setShowModal}
      show={showModal}
      title={`Before you start, add an ABI`}
    >
      <Form.Root>
        <Flex inline justify="spaceBetween">
          <Text>Contract ABI</Text>
          <Upload>
            <Text>Upload</Text>
            <Form.Input type="file" title="Upload" onChange={handleUpload} />
          </Upload>
        </Flex>
        <CodeWrapper>
          <CodeBlock customStyle={{ overflowY: 'scroll', maxHeight: MAX_CODE_HEIGHT }} language="json">
            {previewAbi ?? '{}'}
          </CodeBlock>
        </CodeWrapper>
      </Form.Root>
    </ConfirmModal>
  );
};
