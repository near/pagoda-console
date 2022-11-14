import TransactionActions from '@/components/explorer/transaction/TransactionActions';
import { NetContext } from '@/components/explorer/utils/NetContext';
import { Box } from '@/components/lib/Box';
import { Card } from '@/components/lib/Card';
import { Flex } from '@/components/lib/Flex';
import { H5 } from '@/components/lib/Heading';
import { useSelectedProject } from '@/hooks/selected-project';
import { styled } from '@/styles/stitches';

const ResultTitle = styled(H5, {
  userSelect: 'none',
});

const TxResultHash = ({ result }: { result: any }) => {
  const hash = result?.hash as string;

  const { environment } = useSelectedProject();
  const net = environment?.net;

  if (!net) {
    return <></>;
  }

  return (
    <Flex stack>
      <ResultTitle>Result</ResultTitle>
      <Card padding="l">
        <Box>
          <NetContext.Provider value={net}>
            <TransactionActions transactionHash={hash} />
          </NetContext.Provider>
        </Box>
      </Card>
    </Flex>
  );
};

export default TxResultHash;
