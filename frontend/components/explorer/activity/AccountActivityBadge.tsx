import * as React from 'react';

import { Tooltip } from '@/components/lib/Tooltip';
import { styled } from '@/styles/stitches';
import { truncateMiddle } from '@/utils/truncate-middle';

import TransactionLink from '../utils/TransactionLink';
import type { AccountActivityAction, ActivityConnectionActions } from './types';

type Props = {
  action: AccountActivityAction | NonNullable<ActivityConnectionActions['parentAction']>;
};

const Wrapper = styled('div', {
  padding: '0 10px',
  minHeight: 30,
  borderRadius: 32,
  backgroundColor: 'var(--color-surface-2)',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 12,
});

const ACTION_NAMES: Record<AccountActivityAction['kind'], string> = {
  transfer: 'Transfer',
  stake: 'Restake',
  deployContract: 'Contract Deployed',
  addKey: 'Access Key Created',
  deleteKey: 'Access Key Deleted',
  functionCall: 'Method called',
  createAccount: 'Account created',
  deleteAccount: 'Account removed',
  batch: 'Batch',
  validatorReward: 'Validator reward',
};

const AccountActivityBadge: React.FC<Props> = React.memo(({ action }) => {
  let children =
    action.kind === 'functionCall' ? (
      <Tooltip content={action.args.methodName}>
        <span>{truncateMiddle(action.args.methodName, 6, 6)}</span>
      </Tooltip>
    ) : (
      ACTION_NAMES[action.kind]
    );
  if ('transactionHash' in action) {
    children = (
      <TransactionLink transactionHash={action.transactionHash} receiptId={action.receiptId}>
        {children}
      </TransactionLink>
    );
  }
  return <Wrapper>{children}</Wrapper>;
});

AccountActivityBadge.displayName = 'AccountActivityBadge';

export default AccountActivityBadge;
