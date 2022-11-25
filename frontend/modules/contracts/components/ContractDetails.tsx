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
import { useSureProjectContext } from '@/hooks/project-context';
import { convertYoctoToNear } from '@/utils/convert-near';
import { formatBytes } from '@/utils/format-bytes';
import { mapEnvironmentSubIdToNet } from '@/utils/helpers';

import { useFinalityStatus, useRecentTransactions } from '../hooks/recent-transactions';

type Contract = Api.Query.Output<'/projects/getContract'>;

interface Props {
  contract: Contract;
}

export function ContractDetails({ contract }: Props) {
  const { metrics, error } = useContractMetrics(contract.address, contract.net);

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

  const net = mapEnvironmentSubIdToNet(useSureProjectContext().environmentSubId);
  const { finalityStatus } = useFinalityStatus(net);
  const { transactions } = useRecentTransactions(contract.address, net);

  return (
    <Flex stack>
      <H2>Recent Transactions</H2>

      {!transactions && <Spinner center />}

      {transactions?.length === 0 && <Text>No recent transactions have occurred for this contract.</Text>}

      <Box css={{ width: '100%' }}>
        {transactions &&
          transactions.map((t) => {
            return (
              <Flex key={t.hash}>
                <Box css={{ flexGrow: 1 }}>
                  {net && (
                    <NetContext.Provider value={net}>
                      <TransactionAction transaction={t} net={net} finalityStatus={finalityStatus} />
                    </NetContext.Provider>
                  )}
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
    </Flex>
  );
}
