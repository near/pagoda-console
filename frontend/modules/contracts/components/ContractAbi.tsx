import { CodeBlock } from '@/components/lib/CodeBlock';
import { Flex } from '@/components/lib/Flex';
import { Message } from '@/components/lib/Message';
import { Spinner } from '@/components/lib/Spinner';
import { useAnyAbi } from '@/modules/contracts/hooks/abi';
import type { Contract } from '@/utils/types';

interface Props {
  contract?: Contract;
}

export const ContractAbi = ({ contract }: Props) => {
  const { contractAbi, embedded } = useAnyAbi(contract);

  return (
    <Flex gap="l" stack="true" autoWidth>
      {!contractAbi && <Spinner size="m" center />}
      {embedded && <Message type="info" content="ABI is embedded in the smart contract" />}
      {contractAbi && <CodeBlock language="json">{JSON.stringify(contractAbi, null, 2)}</CodeBlock>}
    </Flex>
  );
};
