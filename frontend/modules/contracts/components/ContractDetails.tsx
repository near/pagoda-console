import type { Api } from '@pc/common/types/api';
import JSBI from 'jsbi';

import TransactionAction from '@/components/explorer/transactions/TransactionAction';
import { NetContext } from '@/components/explorer/utils/NetContext';
import { Box } from '@/components/lib/Box';
import { Card } from '@/components/lib/Card';
import { Flex } from '@/components/lib/Flex';
import { H2 } from '@/components/lib/Heading';
import { Placeholder } from '@/components/lib/Placeholder';
import { Spinner } from '@/components/lib/Spinner';
import { Text } from '@/components/lib/Text';
import { useRpc, useRpcQuery } from '@/hooks/rpc';
import { convertYoctoToNear } from '@/utils/convert-near';
import { formatBytes } from '@/utils/format-bytes';

import { useRecentTransactions } from '../hooks/recent-transactions';

type Contract = Api.Query.Output<'/projects/getContract'>;

interface Props {
  contract?: Contract;
}

export function ContractDetails({ contract }: Props) {
  const metricsQuery = useRpcQuery(
    contract?.net ?? 'TESTNET',
    'view_account',
    { finality: 'final', account_id: contract?.address },
    { retry: false, enabled: Boolean(contract) },
  );

  return (
    <Flex stack gap="l">
      <Card padding="m" borderRadius="m">
        <Flex gap="l" justify={{ '@initial': 'spaceEvenly', '@mobile': 'start' }} wrap>
          <Metric
            label="Balance"
            value={metricsQuery.status === 'success' ? convertYoctoToNear(metricsQuery.data.amount, true) : undefined}
            error={metricsQuery.error}
          />
          <Metric
            label="Storage"
            value={metricsQuery.status === 'success' ? formatBytes(metricsQuery.data.storage_usage) : undefined}
            error={metricsQuery.error}
          />
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
  const blockFinalityQuery = useRpc(
    contract?.net ?? 'TESTNET',
    'block',
    { finality: 'final' },
    { enabled: Boolean(contract) },
  );
  const finalBlockTimestampNanosecond = blockFinalityQuery.data
    ? JSBI.BigInt(blockFinalityQuery.data.header.timestamp_nanosec)
    : undefined;
  const { transactions } = useRecentTransactions(contract?.address, contract?.net);

  return (
    <Flex stack>
      <H2>Recent Transactions</H2>

      {!transactions && <Spinner center />}

      {transactions?.length === 0 && <Text>No recent transactions have occurred for this contract.</Text>}

      <Box css={{ width: '100%' }}>
        {transactions &&
          transactions.map((t) => {
            return (
              <Box css={{ flexGrow: 1 }} key={t.hash}>
                {contract && (
                  <NetContext.Provider value={contract.net}>
                    <TransactionAction
                      transaction={t}
                      net={contract.net}
                      finalBlockTimestampNanosecond={finalBlockTimestampNanosecond}
                    />
                  </NetContext.Provider>
                )}
              </Box>
            );
          })}
      </Box>
    </Flex>
  );
}
