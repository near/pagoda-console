import React from 'react';

import { Tooltip } from '@/components/lib/Tooltip';
import { truncateMiddle } from '@/utils/truncate-middle';

import Link from './Link';

export interface Props {
  children?: React.ReactNode;
  accountId: string;
}

const AccountLink = React.memo(({ accountId, children }: Props) => {
  const link = <Link href={`accounts/${accountId}`}>{children || truncateMiddle(accountId, 12, 12)}</Link>;
  if (!children) {
    return <Tooltip content={accountId}>{link}</Tooltip>;
  }
  return link;
});

AccountLink.displayName = 'AccountLink';

export default AccountLink;
