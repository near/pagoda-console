import { useEffect, useState } from 'react';

import { ContractTransaction } from '@/modules/contracts/components/ContractTransaction';
import { UploadContractAbi } from '@/modules/contracts/components/UploadContractAbi';
import { useContractAbi } from '@/modules/contracts/hooks/abi';
import type { Contract } from '@/utils/types';

interface Props {
  contract?: Contract;
}

export const ContractInteract = ({ contract }: Props) => {
  const [abiUploaded, setAbiUploaded] = useState(false);
  const { contractAbi } = useContractAbi(contract?.slug);

  useEffect(() => {
    if (contractAbi) {
      setAbiUploaded(true);
    }
  }, [contractAbi]);

  if (!contract || !contract.address) return null;

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
