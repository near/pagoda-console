import { Box } from '@/components/lib/Box';
import { Card } from '@/components/lib/Card';
import { CodeBlock } from '@/components/lib/CodeBlock';
import { Flex } from '@/components/lib/Flex';
import { H5 } from '@/components/lib/Heading';
import { styled } from '@/styles/stitches';

import type { TxResultCodeProps } from './types';

const ResultTitle = styled(H5, {
  userSelect: 'none',
});

const TxResultCode = ({ result }: TxResultCodeProps) => (
  <Flex stack>
    <ResultTitle>Result</ResultTitle>
    <Card padding="l">
      <Box>
        <CodeBlock>{JSON.stringify(result, null, 2)}</CodeBlock>
      </Box>
    </Card>
  </Flex>
);

export default TxResultCode;
