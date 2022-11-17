import type { Api } from '@pc/common/types/api';
import { useEffect } from 'react';

import { Container } from '@/components/lib/Container';
import { Flex } from '@/components/lib/Flex';
import { Spinner } from '@/components/lib/Spinner';
import { openToast } from '@/components/lib/Toast';
import { ContractTransaction } from '@/modules/contracts/components/ContractTransaction';
import { UploadContractAbi } from '@/modules/contracts/components/UploadContractAbi';
import { useAnyAbi } from '@/modules/contracts/hooks/abi';

type Contract = Api.Query.Output<'/projects/getContract'>;

interface Props {
  contract: Contract;
}

export const ContractInteract = ({ contract }: Props) => {
  const { embeddedQuery, query: abiQuery } = useAnyAbi(contract);
  const error = embeddedQuery.error || abiQuery.error;
  useEffect(() => {
    if (error && (error as any).message && ['Failed to fetch', 'ABI_NOT_FOUND'].indexOf((error as any).message) < 0) {
      openToast({
        type: 'error',
        title: 'Failed to retrieve ABI.',
      });
    }
  }, [error]);

  if (!contract?.slug || embeddedQuery.isLoading) {
    return (
      <Container size="s">
        <Flex stack align="center">
          <Spinner size="m" />
        </Flex>
      </Container>
    );
  }

  if (embeddedQuery.data || abiQuery.data) {
    return <ContractTransaction contract={contract} />;
  }

  return <UploadContractAbi contractSlug={contract.slug} />;
};
