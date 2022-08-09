import * as React from 'react';

import { Tooltip } from '@/components/lib/Tooltip';

import Link from './Link';

export interface Props {
  children?: React.ReactNode;
  transactionHash: string;
  receiptId?: string;
}

const TransactionLink: React.FC<Props> = React.memo(({ transactionHash, receiptId, children }) => {
  const transactionWithReceiptId = `${transactionHash}${receiptId ? `#${receiptId}` : ''}`;
  const link = (
    <Link href={`/transactions/${transactionWithReceiptId}`}>
      {children ? children : `${transactionHash.substring(0, 7)}…`}
    </Link>
  );
  if (!children) {
    return <Tooltip content={transactionWithReceiptId}>{link}</Tooltip>;
  }
  return link;
});

TransactionLink.displayName = 'TransactionLink';

export default TransactionLink;
