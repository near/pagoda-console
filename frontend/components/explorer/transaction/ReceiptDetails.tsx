import type { Explorer } from '@pc/common/types/core';
import * as React from 'react';

import { CodeBlock } from '@/components/lib/CodeBlock';
import { H4 } from '@/components/lib/Heading';
import { styled } from '@/styles/stitches';

type Props = {
  receipt: Explorer.NestedReceiptWithOutcome;
};

const DetailsWrapper = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  paddingBottom: 'var(--space-l)',
});

const Row = styled('div', {
  display: 'flex',
  justifyContent: 'space-between',
  margin: '20px 0',

  '&:last-child': {
    margin: 0,
  },
});

const Column = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  overflow: 'hidden',

  '& > *:not(:first-child)': {
    marginTop: 16,
  },
});

const Title = styled(H4, {
  marginBottom: 8,
});

const ReceiptDetails: React.FC<Props> = React.memo(({ receipt }) => {
  let statusInfo;

  if (receipt.outcome.status.type === 'successValue') {
    if (receipt.outcome.status.value.length === 0) {
      statusInfo = <CodeBlock>Empty result</CodeBlock>;
    } else {
      statusInfo = <CodeBlock>{receipt.outcome.status.value}</CodeBlock>;
    }
  } else if (receipt.outcome.status.type === 'failure') {
    statusInfo = <CodeBlock language="json">{JSON.stringify(receipt.outcome.status.error, null, 4)}</CodeBlock>;
  } else if (receipt.outcome.status.type === 'successReceiptId') {
    statusInfo = <CodeBlock>{receipt.outcome.status.receiptId}</CodeBlock>;
  }
  return (
    <DetailsWrapper>
      <Row>
        <Column>
          <div>
            <Title>Logs</Title>
            <CodeBlock>{receipt.outcome.logs.length === 0 ? 'No logs' : receipt.outcome.logs.join('\n')}</CodeBlock>
          </div>
          <div>
            <Title>Result</Title>
            {statusInfo}
          </div>
        </Column>
      </Row>
    </DetailsWrapper>
  );
});

ReceiptDetails.displayName = 'ReceiptDetails';

export default ReceiptDetails;
