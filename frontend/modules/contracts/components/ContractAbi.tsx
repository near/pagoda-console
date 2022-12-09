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
  const { embeddedQuery, privateQuery } = useAnyAbi(contract);
  const abi = embeddedQuery.data?.abi || privateQuery.data?.abi;
  const upgraded = embeddedQuery.data?.upgraded || privateQuery.data?.upgraded;

  return (
    <Flex gap="l" stack="true" autoWidth>
      {(embeddedQuery.isValidating || privateQuery.isValidating) && <Spinner size="m" center />}
      {embeddedQuery.data && <Message type="info" content="This contract has an embedded ABI." />}
      {upgraded && (
        <Message
          type="info"
          content="This contract's ABI was automatically upgraded to the latest schema version (v0.3.0)."
        />
      )}
      {abi && <CodeBlock language="json">{JSON.stringify(abi, null, 2)}</CodeBlock>}
    </Flex>
  );
};
