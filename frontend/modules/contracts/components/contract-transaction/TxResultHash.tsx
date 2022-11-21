import TransactionActions from '@/components/explorer/transaction/TransactionActions';
import { NetContext } from '@/components/explorer/utils/NetContext';
import { Box } from '@/components/lib/Box';
import { Card } from '@/components/lib/Card';
import { Flex } from '@/components/lib/Flex';
import { H5 } from '@/components/lib/Heading';
import { useCurrentEnvironment } from '@/hooks/environments';
import { styled } from '@/styles/stitches';

import type { TxResultHashProps } from './types';

const ResultTitle = styled(H5, {
  userSelect: 'none',
});

const TxResultHash = ({ result }: TxResultHashProps) => {
  const hash = result?.hash as string;
  const { environment } = useCurrentEnvironment();
  const net = environment?.net;

  return (
    <Flex stack>
      <ResultTitle>Result</ResultTitle>
      {net && (
        <Card padding="l">
          <Box>
            <NetContext.Provider value={net}>
              <TransactionActions transactionHash={hash} />
            </NetContext.Provider>
          </Box>
        </Card>
      )}
    </Flex>
  );
};

export default TxResultHash;
