import { useState } from 'react';

import { Flex } from '@/components/lib/Flex';
import { Message } from '@/components/lib/Message';
import { Text } from '@/components/lib/Text';
import { openToast } from '@/components/lib/Toast';
import { ConfirmModal } from '@/components/modals/ConfirmModal';
import { deleteContract } from '@/hooks/contracts';
import type { Contract } from '@/utils/types';

interface Props {
  contract: Contract;
  show: boolean;
  setShow: (show: boolean) => void;
  onDelete?: (contract: Contract) => void;
}

export function DeleteContractModal({ contract, show, setShow, onDelete }: Props) {
  const [isDeleting, setIsDeleting] = useState(false);

  async function onConfirm() {
    setIsDeleting(true);

    const success = await deleteContract(contract);

    if (success) {
      onDelete && onDelete(contract);
      setShow(false);
      openToast({
        type: 'success',
        title: 'Contract Removed',
        description: `${contract.address}`,
      });
    } else {
      setIsDeleting(false);
      openToast({
        type: 'error',
        title: 'Remove Error',
        description: 'Failed to remove contract.',
      });
    }
  }

  return (
    <ConfirmModal
      confirmColor="danger"
      confirmText="Remove"
      isProcessing={isDeleting}
      onConfirm={onConfirm}
      setShow={setShow}
      show={show}
      title={`Remove Contract`}
    >
      <Flex stack>
        <Text>{`The following contract will be removed from your project's console environment:`}</Text>

        <Text color="text1" weight="semibold" as="span">
          {contract.address}
        </Text>
      </Flex>

      <Message type="info" content="This won't affect the actual contract on the blockchain." />
    </ConfirmModal>
  );
}
