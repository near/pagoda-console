import { CodeBlock } from '@/components/lib/CodeBlock';
import { Flex } from '@/components/lib/Flex';
import { Spinner } from '@/components/lib/Spinner';
import { useContractAbi } from '@/modules/contracts/hooks/abi';
import type { Contract } from '@/utils/types';

interface Props {
  contract?: Contract;
}

export const ContractAbi = ({ contract }: Props) => {
  const { contractAbi } = useContractAbi(contract?.slug);

  return (
    <Flex gap="l" stack={{ '@laptop': true }} autoWidth>
      {!contractAbi && <Spinner size="m" center />}
      {contractAbi && <CodeBlock language="json">{JSON.stringify(contractAbi, null, 2)}</CodeBlock>}
    </Flex>
  );
};
