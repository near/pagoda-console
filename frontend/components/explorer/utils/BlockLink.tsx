import * as React from 'react';

import { Tooltip } from '@/components/lib/Tooltip';

import Link from './Link';

export interface Props {
  blockHash: string;
  blockHeight?: number;
  children?: React.ReactNode;
}

const BlockLink: React.FC<Props> = React.memo(({ blockHash, blockHeight, children }) => {
  const link = (
    <Link href={`/blocks/${blockHash}`}>
      {children ? children : blockHeight ? `#${blockHeight}` : `${blockHash.substring(0, 7)}…`}
    </Link>
  );
  if (!children) {
    return <Tooltip content={blockHash}>{link}</Tooltip>;
  }
  return link;
});

BlockLink.displayName = 'BlockLink';

export default BlockLink;
