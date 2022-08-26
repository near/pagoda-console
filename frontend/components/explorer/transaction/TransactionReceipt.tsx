import * as React from 'react';

import { styled } from '@/styles/stitches';

import AccountLink from '../utils/AccountLink';
import ReceiptInfo from './ReceiptInfo';
import ReceiptKind from './ReceiptKind';
import type { NestedReceiptWithOutcome } from './types';

type Props = {
  receipt: NestedReceiptWithOutcome;
  convertionReceipt: boolean;
  fellowOutgoingReceipts: NestedReceiptWithOutcome[];
  className: string;
  customCss?: React.CSSProperties;
  expandAll: boolean;
};

const Author = styled('div', {
  display: 'flex',
  alignItems: 'center',
  fontWeight: 600,
  fontSize: 14,
  lineHeight: '150%',
  position: 'relative',
});

const Predecessor = styled(Author, {
  marginBottom: 10,
});

const Receiver = styled(Author, {
  marginTop: 10,
});

const ActionItems = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  borderLeft: '.5px solid var(--color-text-2)',
  marginLeft: 8.5,
  padding: '4px 0 4px 14px',
});

const ReceiptWrapper = styled('div', {
  marginTop: 10,
  marginLeft: 8.5,
  paddingLeft: 33,
  borderLeft: '.5px solid var(--color-text-2)',

  [`& ${Author}`]: {
    '&:last-child': {
      '&::before': {
        display: 'block',
        content: '',
        position: 'absolute',
        width: 5,
        height: 5,
        bottom: 28,
        left: 6.235,
        borderRight: '1px solid var(--color-text-2)',
        borderTop: '1px solid var(--color-text-2)',
        transform: 'rotate(135deg)',
      },
    },
  },

  '&.lastFellowReceipt': {
    paddingBottom: 20,
    marginTop: 0,
  },

  '&.lastNonRefundReceipt': {
    borderLeftColor: 'transparent',
    paddingLeft: 0,
  },

  variants: {
    convertionReceipt: {
      true: {
        paddingLeft: 0,
        borderLeftColor: 'transparent',
        marginTop: 0,
      },
    },
  },
});

const Avatar = styled('div', {
  width: 20,
  height: 20,
  backgroundColor: 'var(--color-text-3)',
  opacity: 0.2,
  borderRadius: '50%',
  marginRight: 8,
});

const ReceiptInfoWrapper = styled('div', {
  borderLeft: '.5px solid var(--color-text-2)',
  marginLeft: 8.5,
});

const TransactionReceiptView: React.FC<Props> = React.memo(
  ({ receipt, convertionReceipt, fellowOutgoingReceipts, className, expandAll }) => {
    const [isTxTypeActive, setTxTypeActive] = React.useState(false);
    const switchActiveTxType = React.useCallback(() => setTxTypeActive((x) => !x), [setTxTypeActive]);

    React.useEffect(() => switchActiveTxType, [expandAll, switchActiveTxType]);

    const remainingFellowOutgoingReceipts = fellowOutgoingReceipts.slice(0, -1);
    const lastFellowOutgoingReceipt = fellowOutgoingReceipts.at(-1);
    const filterRefundNestedReceipts = receipt.outcome.nestedReceipts.filter(
      (receipt) => receipt.predecessorId !== 'system',
    );
    const nonRefundNestedReceipts = filterRefundNestedReceipts.slice(0, -1);
    const lastNonRefundNestedReceipt = filterRefundNestedReceipts.at(-1);

    return (
      <>
        <ReceiptWrapper convertionReceipt={convertionReceipt} className={className}>
          {convertionReceipt ? (
            <Predecessor>
              <Avatar />
              <AccountLink accountId={receipt.predecessorId} />
            </Predecessor>
          ) : null}

          {lastFellowOutgoingReceipt ? (
            <TransactionReceiptView
              receipt={lastFellowOutgoingReceipt}
              convertionReceipt={false}
              fellowOutgoingReceipts={remainingFellowOutgoingReceipts}
              className="lastFellowReceipt"
              expandAll={expandAll}
            />
          ) : null}
          <ActionItems>
            {receipt.actions.map((action, index) => (
              <ReceiptKind
                key={`${action.kind}_${index}`}
                action={action}
                onClick={switchActiveTxType}
                isTxTypeActive={isTxTypeActive}
              />
            ))}
          </ActionItems>
          {isTxTypeActive ? (
            <ReceiptInfoWrapper>
              <ReceiptInfo receipt={receipt} />
            </ReceiptInfoWrapper>
          ) : null}

          <Receiver>
            <Avatar />
            <span>{receipt.receiverId}</span>
          </Receiver>
        </ReceiptWrapper>
        {lastNonRefundNestedReceipt ? (
          <TransactionReceiptView
            receipt={lastNonRefundNestedReceipt}
            convertionReceipt={false}
            fellowOutgoingReceipts={nonRefundNestedReceipts}
            className="lastNonRefundReceipt"
            expandAll={expandAll}
          />
        ) : null}
      </>
    );
  },
);

TransactionReceiptView.displayName = 'TransactionReceiptView';

export default TransactionReceiptView;
