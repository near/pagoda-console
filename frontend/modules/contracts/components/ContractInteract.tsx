import { useEffect, useState } from 'react';

import { Container } from '@/components/lib/Container';
import { Flex } from '@/components/lib/Flex';
import { Spinner } from '@/components/lib/Spinner';
import { openToast } from '@/components/lib/Toast';
import { ContractTransaction } from '@/modules/contracts/components/ContractTransaction';
import { UploadContractAbi } from '@/modules/contracts/components/UploadContractAbi';
import { useContractAbi } from '@/modules/contracts/hooks/abi';
import type { Contract } from '@/utils/types';

interface Props {
  contract?: Contract;
}

export const ContractInteract = ({ contract }: Props) => {
  const [abiUploaded, setAbiUploaded] = useState<boolean | undefined>(undefined);
  const { contractAbi, error } = useContractAbi(contract?.slug);

  useEffect(() => {
    if (contractAbi) {
      setAbiUploaded(true);
    } else if (error?.message === 'ABI_NOT_FOUND') {
      setAbiUploaded(false);
    } else {
      setAbiUploaded(undefined);
    }
  }, [contract, contractAbi, error]);

  if (error && error?.message !== 'ABI_NOT_FOUND') {
    openToast({
      type: 'error',
      title: 'Failed to retrieve ABI.',
    });
  }

  if (!contract?.slug || abiUploaded === undefined) {
    return (
      <Container size="s">
        <Flex stack align="center">
          <Spinner size="m" />
        </Flex>
      </Container>
    );
  }

  return (
    <>
      {!abiUploaded ? (
        <UploadContractAbi contractSlug={contract.slug} setAbiUploaded={setAbiUploaded} />
      ) : (
        <ContractTransaction contract={contract} />
      )}
    </>
  );
};
