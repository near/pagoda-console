import type { Explorer } from '@pc/common/types/core';
import * as React from 'react';

import { styled } from '@/styles/stitches';
import { StableId } from '@/utils/stable-ids';

import { Button } from '../../lib/Button';
import CodeArgs from '../utils/CodeArgs';
import { NearAmount } from '../utils/NearAmount';

interface Props {
  action: Explorer.Action;
  onClick: React.MouseEventHandler;
  isTxTypeActive: boolean;
}

const Wrapper = styled('div', {
  alignItems: 'center',
  margin: '10px 0',
});

const Description = styled('div', {
  marginLeft: 12,
  display: 'inline-flex',
  fontWeight: 400,
  fontSize: 14,
  lineHeight: '150%',

  '& span': {
    fontWeight: 600,
  },
});

const ArgsWrapper = styled('div', {
  padding: '10px 0',
});

const ExpandSign = styled('span', {
  marginLeft: 8,
});

const RECEIPT_TYPES = {
  transfer: 'Transfer',
  stake: 'Restake',
  deployContract: 'Contract Deployed',
  addKey: 'Access Key Created',
  deleteKey: 'Access Key Deleted',
  functionCall: '',
  createAccount: 'Account created',
  deleteAccount: 'Account removed',
  refund: 'Refund',
};

const ReceiptKind: React.FC<Props> = React.memo(({ action, onClick, isTxTypeActive }) => {
  return (
    <Wrapper>
      <Button stableId={StableId.RECEIPT_KIND_EXPAND_BUTTON} size="s" onClick={onClick}>
        {RECEIPT_TYPES[action.kind]}
        {action.kind === 'functionCall' ? <Description>&apos;{action.args.methodName}&apos;</Description> : null}
        <ExpandSign>{isTxTypeActive ? '-' : '+'}</ExpandSign>
      </Button>
      {action.kind === 'transfer' ? (
        <Description>
          <span>
            <NearAmount amount={action.args.deposit} decimalPlaces={2} />
          </span>
        </Description>
      ) : null}
      {action.kind === 'functionCall' && isTxTypeActive ? (
        <ArgsWrapper>
          <CodeArgs args={action.args.args} />
        </ArgsWrapper>
      ) : null}
    </Wrapper>
  );
});

ReceiptKind.displayName = 'ReceiptKind';

export default ReceiptKind;
