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
import { useApiMutation } from '@/hooks/api-mutation';
import analytics from '@/utils/analytics';
import { handleMutationError } from '@/utils/error-handlers';
import { StableId } from '@/utils/stable-ids';

const MAX_CODE_HEIGHT = '18rem';

type Props = {
  contractSlug: string;
  onUpload: () => void;
};

export const UploadContractAbi = ({ contractSlug, onUpload }: Props) => {
  const [showModal, setShowModal] = useState(true);
  const [showUpgradeText, setShowUpgradeText] = useState(false);
  const [previewAbi, setPreviewAbi] = useState<AbiRoot | null>(null);

  const uploadAbiMutation = useApiMutation('/abi/addContractAbi', {
    onSuccess: () => {
      openToast({
        type: 'success',
        title: 'Contract ABI was uploaded',
      });

      setShowModal(false);

      analytics.track('DC Upload Contract ABI', {
        status: 'success',
        contract: contractSlug,
      });

      onUpload();
    },
    onError: (error) => {
      handleMutationError({
        error,
        eventLabel: 'DC Upload Contract ABI',
        eventData: {
          contract: contractSlug,
        },
        toastTitle: 'Failed to remove contract.',
      });
    },
  });

  async function uploadAbi() {
    if (!previewAbi) {
      // TODO this should be implemented as form validation error message instead.
      openToast({
        type: 'error',
        title: 'Error on Contract ABI Upload',
        description: `${contractSlug}`,
      });
      return;
    }
    uploadAbiMutation.mutate({ contract: contractSlug, abi: previewAbi });
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

        <Flex align="center" stack={{ '@tablet': true }}>
          <DragAndDropLabel
            css={{ flexGrow: 1 }}
            stableId={StableId.UPLOAD_CONTRACT_ABI_MODAL_CHOOSE_FILE_BUTTON}
            onChange={handleDrop}
          >
            <FeatherIcon color="primary" size="s" icon="upload" />
            Choose or drop a file
            <Form.Input
              type="file"
              onChange={handleUpload}
              file
              tabIndex={-1}
              accept="application/JSON"
              stableId={StableId.UPLOAD_CONTRACT_ABI_MODAL_CHOOSE_FILE_INPUT}
            />
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
