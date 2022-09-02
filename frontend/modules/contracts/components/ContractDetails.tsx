import BN from 'bn.js';
import { useEffect, useState } from 'react';

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
import config from '@/utils/config';
import { convertYoctoToNear } from '@/utils/convert-near';
import { formatBytes } from '@/utils/format-bytes';
import type { Environment, NetOption } from '@/utils/types';
import type { FinalityStatus } from '@/utils/types';
import type { Contract } from '@/utils/types';

import { useRecentTransactions } from '../hooks/recent-transactions';
interface Props {
  contract?: Contract;
  environment?: Environment;
}

export function ContractDetails({ contract, environment }: Props) {
  const { metrics, error } = useContractMetrics(contract?.address, contract?.net);

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

      <RecentTransactionList contract={contract} net={environment?.net} />
    </Flex>
  );
}

function RecentTransactionList({ contract, net }: { contract?: Contract; net?: NetOption }) {
  // NOTE: This component and following code is legacy and will soon be replaced by new explorer components.

  const [finalityStatus, setFinalityStatus] = useState<FinalityStatus>();
  const { transactions } = useRecentTransactions(contract?.address, net);

  useEffect(() => {
    if (!net) return;
    fetchFinality(net);
  }, [net]);

  async function fetchFinality(net: NetOption) {
    const res = await fetch(config.url.rpc.default[net], {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'dontcare',
        method: 'block',
        params: {
          finality: 'final',
        },
      }),
    }).then((res) => res.json());
    if (res.error) {
      throw new Error(res.error.name);
    }
    const finalBlock = res.result;
    const newStatus = {
      finalBlockTimestampNanosecond: new BN(finalBlock.header.timestamp_nanosec),
      finalBlockHeight: finalBlock.header.height,
    };
    setFinalityStatus(newStatus);
  }

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
