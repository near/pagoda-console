import type { Api } from '@pc/common/types/api';

import { CodeBlock } from '@/components/lib/CodeBlock';
import { Flex } from '@/components/lib/Flex';
import { Message } from '@/components/lib/Message';
import { Spinner } from '@/components/lib/Spinner';
import { useAnyAbi } from '@/modules/contracts/hooks/abi';

type Contract = Api.Query.Output<'/projects/getContracts'>[number];

interface Props {
  contract?: Contract;
}

export const ContractAbi = ({ contract }: Props) => {
  const { contractAbi, embedded } = useAnyAbi(contract);

  return (
    <Flex gap="l" stack="true" autoWidth>
      {!contractAbi && <Spinner size="m" center />}
      {embedded && <Message type="info" content="This contract has an embedded ABI." />}
      {contractAbi && <CodeBlock language="json">{JSON.stringify(contractAbi, null, 2)}</CodeBlock>}
    </Flex>
  );
};
