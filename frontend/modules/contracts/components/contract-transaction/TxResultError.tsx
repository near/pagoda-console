import { Flex } from '@/components/lib/Flex';
import { H5 } from '@/components/lib/Heading';
import { Message } from '@/components/lib/Message';
import { styled } from '@/styles/stitches';

import type { TxResultErrorProps } from './types';

const ResultTitle = styled(H5, {
  userSelect: 'none',
});

const TxResultError = ({ error }: TxResultErrorProps) => (
  <Flex stack>
    <ResultTitle>Result</ResultTitle>
    <Message type="error" content={error.toString()} />
  </Flex>
);

export default TxResultError;
