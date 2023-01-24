import type { Api } from '@pc/common/types/api';

import { Flex } from '@/components/lib/Flex';
import { Message } from '@/components/lib/Message';
import { Text } from '@/components/lib/Text';
import { openToast } from '@/components/lib/Toast';
import { ConfirmModal } from '@/components/modals/ConfirmModal';
import { useApiMutation } from '@/hooks/api-mutation';
import analytics from '@/utils/analytics';
import { handleMutationError } from '@/utils/error-handlers';

type Contract = Api.Query.Output<'/projects/getContracts'>[number];

interface Props {
  contract: Contract;
  show: boolean;
  setShow: (show: boolean) => void;
  onDelete: () => void;
}

export function DeleteContractModal({ contract, show, setShow, onDelete }: Props) {
  const removeContractMutation = useApiMutation('/projects/removeContract', {
    onSuccess: () => {
      openToast({
        type: 'success',
        title: 'Contract Removed',
        description: `${contract.address}`,
      });

      analytics.track('DC Remove Contract', {
        status: 'success',
        contractId: contract.address,
      });

      onDelete();
    },
    onError: (error) => {
      handleMutationError({
        error,
        eventLabel: 'DC Remove Contract',
        eventData: {
          contractId: contract.address,
        },
        toastTitle: 'Failed to remove contract.',
      });
    },
  });

  const onConfirm = () => removeContractMutation.mutate({ slug: contract.slug });

  return (
    <ConfirmModal
      confirmColor="danger"
      confirmText="Remove"
      isProcessing={removeContractMutation.isLoading}
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
