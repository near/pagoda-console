import type { Api } from '@pc/common/types/api';

import { CodeBlock } from '@/components/lib/CodeBlock';
import { Flex } from '@/components/lib/Flex';
import { Message } from '@/components/lib/Message';
import { Spinner } from '@/components/lib/Spinner';
import { useAnyAbi } from '@/modules/contracts/hooks/abi';

type Contract = Api.Query.Output<'/projects/getContracts'>[number];

interface Props {
  contract: Contract;
}

export const ContractAbi = ({ contract }: Props) => {
  const { embeddedQuery, privateQuery } = useAnyAbi(contract);
  const abi = embeddedQuery.data?.abi || privateQuery.data?.abi;

  return (
    <Flex gap="l" stack="true" autoWidth>
      {embeddedQuery.isValidating || (privateQuery.isLoading && <Spinner size="m" center />)}
      {embeddedQuery.data && <Message type="info" content="This contract has an embedded ABI." />}
      {abi && <CodeBlock language="json">{JSON.stringify(abi, null, 2)}</CodeBlock>}
    </Flex>
  );
};
