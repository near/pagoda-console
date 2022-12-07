import { upgradeAbi } from '@pc/abi/upgrade';
import type { AbiRoot } from 'near-abi-client-js';
import type { ChangeEvent, DragEvent } from 'react';
import { useCallback, useEffect, useState } from 'react';

import { Button, ButtonLink } from '@/components/lib/Button';
import { Card } from '@/components/lib/Card';
import { CodeBlock } from '@/components/lib/CodeBlock';
import { DragAndDropLabel } from '@/components/lib/DragAndDrop';
import { FeatherIcon } from '@/components/lib/FeatherIcon';
import { Flex } from '@/components/lib/Flex';
import * as Form from '@/components/lib/Form';
import { Message } from '@/components/lib/Message';
import { Text } from '@/components/lib/Text';
import { TextLink } from '@/components/lib/TextLink';
import { openToast } from '@/components/lib/Toast';
import { ConfirmModal } from '@/components/modals/ConfirmModal';
import { uploadContractAbi } from '@/modules/contracts/hooks/abi';
import { StableId } from '@/utils/stable-ids';

const MAX_CODE_HEIGHT = '18rem';

type Props = {
  contractSlug: string;
  setAbiUploaded: (arg0: boolean) => void;
};

export const UploadContractAbi = ({ contractSlug, setAbiUploaded }: Props) => {
  const [showModal, setShowModal] = useState(true);
  const [previewAbi, setPreviewAbi] = useState<AbiRoot | null>(null);
  const [showUpgradeText, setShowUpgradeText] = useState(false);

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
    const uploaded = await uploadContractAbi(contractSlug, previewAbi);
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

  function tryLoadPreview(content: any) {
    try {
      const parsedAbi = JSON.parse(content);
      const upgradedAbi = upgradeAbi(parsedAbi);
      setPreviewAbi(upgradedAbi.abiRoot);
      setShowUpgradeText(upgradedAbi.upgraded);
    } catch {
      openToast({
        type: 'error',
        title: 'Error parsing ABI',
        description: 'Please ensure file is in JSON format.',
      });
      return null;
    }
  }

  const loadFilePreview = useCallback((file: any, onFileLoaded: any = null) => {
    const fileReader = new FileReader();
    fileReader.readAsText(file, 'UTF-8');
    fileReader.onload = (e) => {
      if (e && e.target && e.target.result) {
        const content = e.target.result as any;
        tryLoadPreview(content);
        if (onFileLoaded) onFileLoaded();
      } else {
        openToast({
          type: 'error',
          title: 'Error on Contract ABI Upload',
        });
        return null;
      }
    };
  }, []);

  const handleUpload = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      if (!e.target.files?.[0]) {
        return null;
      }
      loadFilePreview(e.target.files[0]);
    },
    [loadFilePreview],
  );

  const handleDrop = useCallback(
    (e: DragEvent<HTMLLabelElement>) => {
      if (!e.dataTransfer?.files[0]) {
        return null;
      }
      loadFilePreview(e.dataTransfer.files[0]);
    },
    [loadFilePreview],
  );

  function handlePaste(event: any) {
    event.preventDefault();
    if (event.clipboardData) {
      // This occurs if the clipboard button has keyboard focus and the user pastes
      const clipText = event.clipboardData?.getData('text');
      tryLoadPreview(clipText);
    } else {
      // Will require users to provide permission to read clipboard
      navigator.clipboard
        .readText()
        .then(tryLoadPreview)
        .catch((reason: any) => {
          openToast({
            type: 'error',
            title: 'Unable to paste contents from clipboard',
            description: `${reason}`,
          });
        });
    }
  }

  useEffect(() => {
    window.addEventListener('paste', handlePaste);
    return () => {
      window.removeEventListener('paste', handlePaste);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // TODO break out modal and default state into separate components. That should help with clearing the form data in the modal.

  return (
    <>
      <Card>
        <Flex stack align="center">
          <FeatherIcon icon="file-text" size="l" />
          <Text>
            To start interacting with our contract we need the ABI first. Drag and drop the ABI file here or follow the
            following options.
          </Text>
          <Flex justify="center">
            <Button
              stableId={StableId.UPLOAD_CONTRACT_ABI_OPEN_UPLOAD_MODAL_BUTTON}
              onClick={() => setShowModal(true)}
              color="primaryBorder"
            >
              Upload ABI
            </Button>
            <ButtonLink
              stableId={StableId.UPLOAD_CONTRACT_ABI_NEAR_ABI_DOCS_LINK}
              href="https://github.com/near/abi"
              external
            >
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
        <TextLink
          stableId={StableId.UPLOAD_CONTRACT_ABI_MODAL_NEAR_ABI_DOCS_LINK}
          href="https://github.com/near/abi"
          external
        >
          To generate an ABI
        </TextLink>

        <Flex align="center">
          <DragAndDropLabel
            css={{ flexGrow: 1 }}
            stableId={StableId.UPLOAD_CONTRACT_ABI_MODAL_CHOOSE_FILE_BUTTON}
            onChange={handleDrop}
          >
            <FeatherIcon color="primary" size="s" icon="upload" />
            Choose or drop a file
            <Form.Input type="file" onChange={handleUpload} file tabIndex={-1} accept="application/JSON" />
          </DragAndDropLabel>

          <Text color="text3" size="bodySmall">
            OR
          </Text>

          <Button
            css={{ flexGrow: 1 }}
            stableId={StableId.UPLOAD_CONTRACT_ABI_MODAL_UPLOAD_CLIPBOARD_BUTTON}
            size="m"
            color="neutral"
            onClick={handlePaste}
          >
            <FeatherIcon color="primary" size="s" icon="clipboard" />
            Upload from clipboard
          </Button>
        </Flex>

        {showUpgradeText && (
          <Message
            type="info"
            content="We upgraded this ABI to the latest schema version (v0.3.0). Please review below."
          />
        )}

        <CodeBlock css={{ maxHeight: MAX_CODE_HEIGHT }} language="json">
          {!previewAbi ? '{}' : JSON.stringify(previewAbi, null, 2)}
        </CodeBlock>
      </ConfirmModal>
    </>
  );
};
