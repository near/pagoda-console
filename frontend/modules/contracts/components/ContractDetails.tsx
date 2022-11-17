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
import { useQuery } from '@/hooks/query';
import { useRpcQuery } from '@/hooks/rpc';
import { convertYoctoToNear } from '@/utils/convert-near';
import { formatBytes } from '@/utils/format-bytes';

import { useFinalityStatus } from '../hooks/recent-transactions';

type Contract = Api.Query.Output<'/projects/getContract'>;

interface Props {
  contract: Contract;
}

export function ContractDetails({ contract }: Props) {
  const { data: metrics, error } = useRpcQuery(
    contract.net,
    'view_account',
    { finality: 'final', account_id: contract.address },
    { retry: false },
  );

  function Metric({ label, value }: { label: string; value?: string }) {
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

  return (
    <Flex stack gap="l">
      <Card padding="m" borderRadius="m">
        <Flex justify="spaceEvenly">
          <Metric label="Balance" value={metrics && convertYoctoToNear(metrics.amount, true)} />
          <Metric label="Storage" value={metrics && formatBytes(metrics.storage_usage)} />
        </Flex>
      </Card>

      <RecentTransactionList contract={contract} />
    </Flex>
  );
}

function RecentTransactionList({ contract }: { contract: Contract }) {
  // NOTE: This component and following code is legacy and will soon be replaced by new explorer components.

  const finalityStatusQuery = useFinalityStatus(contract.net);

  // TODO (P2+) look into whether using contracts as part of the react-query key will cause a large
  // amount of unnecessary caching, since every modification to the contract set will be a
  // separate key
  const transactionsQuery = useQuery([
    '/explorer/getTransactions',
    { net: contract.net, contracts: [contract.address] },
  ]);

  return (
    <Flex stack>
      <H2>Recent Transactions</H2>
      {transactionsQuery.status === 'loading' ? (
        <Spinner center />
      ) : transactionsQuery.status === 'error' ? (
        <div>Error while loading transactions</div>
      ) : transactionsQuery.data.length === 0 ? (
        <Text>No recent transactions have occurred for this contract.</Text>
      ) : (
        <Box css={{ width: '100%' }}>
          {transactionsQuery.data.map((t) => {
            return (
              <Flex key={t.hash}>
                <Box css={{ flexGrow: 1 }}>
                  <NetContext.Provider value={contract.net}>
                    <TransactionAction transaction={t} net={contract.net} finalityStatus={finalityStatusQuery.data} />
                  </NetContext.Provider>
                </Box>

                <Text
                  css={{
                    marginTop: 'auto',
                    marginBottom: 'auto',
                    color: 'var(--color-text-2)',
                    paddingLeft: 'var(--space-m)',
                  }}
                >
                  {t.sourceContract}
                </Text>
              </Flex>
            );
          })}
        </Box>
      )}
    </Flex>
  );
}
