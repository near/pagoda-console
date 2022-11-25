import type { Api } from '@pc/common/types/api';
import { useCallback } from 'react';
import { mutate } from 'swr';

import { Flex } from '@/components/lib/Flex';
import { Message } from '@/components/lib/Message';
import { Text } from '@/components/lib/Text';
import { openToast } from '@/components/lib/Toast';
import { ConfirmModal } from '@/components/modals/ConfirmModal';
import { useAuth } from '@/hooks/auth';
import { useMutation } from '@/hooks/mutation';
import { useSureProjectContext } from '@/hooks/project-context';

type Contract = Api.Query.Output<'/projects/getContracts'>[number];

interface Props {
  contract: Contract;
  show: boolean;
  setShow: (show: boolean) => void;
  onDelete?: () => void;
}

export function DeleteContractModal({ contract, show, setShow, onDelete }: Props) {
  const { projectSlug, environmentSubId } = useSureProjectContext();
  const { identity } = useAuth();
  const removeContractMutation = useMutation('/projects/removeContract', {
    onSuccess: () => {
      mutate<Contract[]>(
        ['/projects/getContracts', projectSlug, environmentSubId, identity?.uid],
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
  const onConfirm = useCallback(() => removeContractMutation.mutate(contract), [removeContractMutation, contract]);

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
