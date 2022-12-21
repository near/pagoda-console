import type { Api } from '@pc/common/types/api';
import { mutate } from 'swr';

import { Flex } from '@/components/lib/Flex';
import { Message } from '@/components/lib/Message';
import { Text } from '@/components/lib/Text';
import { openToast } from '@/components/lib/Toast';
import { ConfirmModal } from '@/components/modals/ConfirmModal';
import { useMutation } from '@/hooks/mutation';
import { useSelectedProject } from '@/hooks/selected-project';

type Contract = Api.Query.Output<'/projects/getContracts'>[number];

interface Props {
  contract: Contract;
  show: boolean;
  setShow: (show: boolean) => void;
  onDelete?: () => void;
}

export function DeleteContractModal({ contract, show, setShow, onDelete }: Props) {
  const { environment, project } = useSelectedProject();
  const removeContractMutation = useMutation('/projects/removeContract', {
    onSuccess: () => {
      mutate<Contract[]>(
        ['/projects/getContracts', project?.slug, environment?.subId],
        (contracts) => contracts && contracts.filter((lookupContract) => lookupContract.slug !== contract.slug),
      );
      openToast({
        type: 'success',
        title: 'Contract Removed',
        description: `${contract.address}`,
      });
      onDelete?.();
    },
    onError: () =>
      openToast({
        type: 'error',
        title: 'Remove Error',
        description: 'Failed to remove contract.',
      }),
    getAnalyticsSuccessData: () => ({ contractId: contract.address }),
    getAnalyticsErrorData: () => ({ contractId: contract.address }),
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
