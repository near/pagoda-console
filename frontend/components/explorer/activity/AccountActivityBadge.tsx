import * as React from 'react';

import { Tooltip } from '@/components/lib/Tooltip';
import { styled } from '@/styles/stitches';
import { shortenString } from '@/utils/formatting';

import type { AccountActivityAction } from './types';

type Props = {
  action: AccountActivityAction;
  href?: string;
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

  variants: {
    as: {
      a: {
        cursor: 'pointer',
      },
    },
  },
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

const AccountActivityBadge: React.FC<Props> = React.memo(({ action, href }) => {
  return (
    <Wrapper as={href ? 'a' : undefined} href={href}>
      {action.kind === 'functionCall' ? (
        <Tooltip content={action.args.methodName}>
          <span>{shortenString(action.args.methodName)}</span>
        </Tooltip>
      ) : (
        ACTION_NAMES[action.kind]
      )}
    </Wrapper>
  );
});

AccountActivityBadge.displayName = 'AccountActivityBadge';

export default AccountActivityBadge;
