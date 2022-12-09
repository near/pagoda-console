import type { Api } from '@pc/common/types/api';

import TransactionAction from '@/components/explorer/transactions/TransactionAction';
import { NetContext } from '@/components/explorer/utils/NetContext';
import { Box } from '@/components/lib/Box';
import { Card } from '@/components/lib/Card';
import { Flex } from '@/components/lib/Flex';
import { H2 } from '@/components/lib/Heading';
import { Placeholder } from '@/components/lib/Placeholder';
import { Spinner } from '@/components/lib/Spinner';
import { Text } from '@/components/lib/Text';
import { useContractMetrics } from '@/hooks/contracts';
import { useQuery } from '@/hooks/query';
import { convertYoctoToNear } from '@/utils/convert-near';
import { formatBytes } from '@/utils/format-bytes';

import { useFinalityStatus } from '../hooks/recent-transactions';

type Contract = Api.Query.Output<'/projects/getContract'>;

interface Props {
  contract?: Contract;
}

export function ContractDetails({ contract }: Props) {
  const { metrics, error } = useContractMetrics(contract?.address, contract?.net);

  return (
    <Flex stack gap="l">
      <Card padding="m" borderRadius="m">
        <Flex gap="l" justify={{ '@initial': 'spaceEvenly', '@mobile': 'start' }} wrap>
          <Metric label="Balance" value={metrics && convertYoctoToNear(metrics.amount, true)} error={error} />
          <Metric label="Storage" value={metrics && formatBytes(metrics.storage_usage)} error={error} />
        </Flex>
      </Card>

      <RecentTransactionList contract={contract} />
    </Flex>
  );
}

function Metric({ label, value, error }: { label: string; value?: string; error?: unknown }) {
  return (
    <Flex stack gap="xs" autoWidth>
      {error ? (
        <Text family="number" color="text1" size="h4">
          N/A
        </Text>
      ) : (
        <>
          {!value && <Placeholder css={{ width: '10rem', height: '2rem' }} />}
          {value && (
            <Text family="number" color="text1" size="h4">
              {value}
            </Text>
          )}
        </>
      )}

      <Text family="heading" color="text3" size="bodySmall" css={{ textTransform: 'uppercase' }}>
        {label}
      </Text>
    </Flex>
  );
}

function RecentTransactionList({ contract }: { contract?: Contract }) {
  // NOTE: This component and following code is legacy and will soon be replaced by new explorer components.

  const { finalityStatus } = useFinalityStatus(contract?.net);
  // TODO (P2+) look into whether using contracts as part of the react-query key will cause a large
  // amount of unnecessary caching, since every modification to the contract set will be a
  // separate key
  const transactionsQuery = useQuery(
    [
      '/explorer/getTransactions',
      contract ? { net: contract.net, contracts: [contract.address] } : { net: 'TESTNET', contracts: [] },
    ],
    { unauth: true, enabled: Boolean(contract) },
  );

  return (
    <Flex stack>
      <H2>Recent Transactions</H2>

      {transactionsQuery.status === 'loading' ? (
        <Spinner center />
      ) : transactionsQuery.status === 'error' ? null : transactionsQuery.data.length === 0 ? (
        <Text>No recent transactions have occurred for this contract.</Text>
      ) : (
        <Box css={{ width: '100%' }}>
          {transactionsQuery.data.map((t) => {
            return (
              <Box css={{ flexGrow: 1 }} key={t.hash}>
                {contract && (
                  <NetContext.Provider value={contract.net}>
                    <TransactionAction transaction={t} net={contract.net} finalityStatus={finalityStatus} />
                  </NetContext.Provider>
                )}
              </Box>
            );
          })}
        </Box>
      )}
    </Flex>
  );
}
