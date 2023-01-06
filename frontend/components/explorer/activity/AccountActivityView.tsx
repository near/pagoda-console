import type { Explorer } from '@pc/common/types/core';
import JSBI from 'jsbi';
import { DateTime } from 'luxon';
import * as React from 'react';
import useSWR from 'swr';

import { Spinner } from '@/components/lib/Spinner';
import { Tooltip } from '@/components/lib/Tooltip';
import { useNet } from '@/hooks/net';
import { styled } from '@/styles/stitches';
import { queryApi } from '@/utils/api';
import * as BI from '@/utils/bigint';

import AccountLink from '../utils/AccountLink';
import BlockLink from '../utils/BlockLink';
import { NearAmount } from '../utils/NearAmount';
import TransactionLink from '../utils/TransactionLink';
import AccountActivityBadge from './AccountActivityBadge';
import {
  ActivityAccountName,
  Amount,
  Badge,
  DateTableElement,
  LinkPrefix,
  TableElement,
  TableHeader,
  TableHeaderCell,
  TableRow,
  TableWrapper,
} from './styles';

type RowProps = {
  item: Explorer.ActivityActionItem;
};

const ActivityItemActionWrapper = styled('div', {
  display: 'flex',
  alignItems: 'center',
  whiteSpace: 'pre',

  '& + &': {
    marginTop: 4,
  },
});

const ActivityItemTitle = styled('span', {
  fontWeight: 'bold',
});

const ActivityItemAction: React.FC<{
  action: Explorer.AccountActivityWithConnection | Explorer.AccountActivityAction;
}> = ({ action }) => {
  const badge = (
    <>
      {'sender' in action ? (
        <>
          <Tooltip content={action.sender}>
            <AccountLink accountId={action.sender} />
          </Tooltip>
          {' → '}
        </>
      ) : null}
      <AccountActivityBadge action={action} />
      {'receiver' in action ? (
        <>
          {' → '}
          <AccountLink accountId={action.receiver} />
        </>
      ) : null}
    </>
  );
  switch (action.kind) {
    case 'transfer': {
      const deltaAmount = JSBI.BigInt(action.args.deposit);
      return (
        <ActivityItemActionWrapper>
          {badge}{' '}
          {JSBI.equal(deltaAmount, BI.zero) ? null : (
            <>
              {' 💸 '}
              <NearAmount amount={action.args.deposit} />
            </>
          )}
        </ActivityItemActionWrapper>
      );
    }
    case 'stake': {
      const deltaAmount = JSBI.BigInt(action.args.stake);
      return (
        <ActivityItemActionWrapper>
          {badge}{' '}
          {JSBI.equal(deltaAmount, BI.zero) ? null : (
            <>
              {' 💸 '}
              <NearAmount amount={action.args.stake} />
            </>
          )}
        </ActivityItemActionWrapper>
      );
    }
    case 'functionCall': {
      const attachedAmount = JSBI.BigInt(action.args.deposit);
      return (
        <ActivityItemActionWrapper>
          {badge}{' '}
          {JSBI.equal(attachedAmount, BI.zero) ? null : (
            <>
              {' 💸 '}
              <NearAmount amount={action.args.deposit} />
            </>
          )}
        </ActivityItemActionWrapper>
      );
    }
    default:
      return <ActivityItemActionWrapper>{badge}</ActivityItemActionWrapper>;
  }
};

const ActivityItemRow: React.FC<RowProps> = ({ item }) => {
  const deltaAmount = JSBI.BigInt(item.deltaAmount);
  const isDeltaAmountZero = JSBI.equal(deltaAmount, BI.zero);
  const isDeltaAmountPositive = JSBI.greaterThan(deltaAmount, BI.zero);
  const absoluteDeltaAmount = isDeltaAmountPositive ? deltaAmount : JSBI.unaryMinus(deltaAmount);
  const actions = item.action.kind === 'batch' ? item.action.actions : [item.action];

  return (
    <>
      {actions.map((subAction, subindex) => {
        const childrenActions = item.action.childrenActions ?? [];
        const blockOrTransactionHash = 'blockHash' in item.action ? item.action.blockHash : item.action.transactionHash;
        return (
          <TableRow key={subindex}>
            <TableElement>
              {subindex === 0 ? (
                <ActivityAccountName>
                  <Badge>{item.direction === 'inbound' ? 'in' : 'out'}</Badge>
                  {item.involvedAccountId ? (
                    <Tooltip content={item.involvedAccountId}>
                      <AccountLink accountId={item.involvedAccountId} />
                    </Tooltip>
                  ) : (
                    'system'
                  )}
                </ActivityAccountName>
              ) : null}
            </TableElement>
            <TableElement>
              <ActivityItemAction action={subAction} />
              {item.action.parentAction ? (
                <>
                  <hr />
                  <ActivityItemTitle>Caused by receipt:</ActivityItemTitle>
                  <ActivityItemAction action={item.action.parentAction} />
                </>
              ) : null}
              {childrenActions.length !== 0 ? (
                <>
                  <hr />
                  <ActivityItemTitle>Children receipts:</ActivityItemTitle>
                  {childrenActions.map((childAction, index) => (
                    <ActivityItemAction key={index} action={childAction} />
                  ))}
                </>
              ) : null}
            </TableElement>
            <TableElement>
              {!isDeltaAmountZero && subindex === 0 ? (
                <Amount direction={isDeltaAmountPositive ? 'income' : 'outcome'}>
                  {isDeltaAmountPositive ? '+' : '-'}
                  <NearAmount amount={absoluteDeltaAmount.toString()} decimalPlaces={2} />
                </Amount>
              ) : (
                '—'
              )}
            </TableElement>
            <TableElement>
              {subindex === 0 ? (
                <>
                  <LinkPrefix>
                    {'transactionHash' in item.action ? (item.action.receiptId ? 'RX' : 'TX') : 'BL'}
                  </LinkPrefix>
                  <Tooltip content={blockOrTransactionHash}>
                    {'blockHash' in item.action ? (
                      <BlockLink blockHash={item.action.blockHash} />
                    ) : (
                      <TransactionLink
                        transactionHash={item.action.transactionHash}
                        receiptId={item.action.receiptId}
                      />
                    )}
                  </Tooltip>
                </>
              ) : null}
            </TableElement>
            <DateTableElement>
              {subindex === 0 ? DateTime.fromMillis(item.timestamp).toRelative({ style: 'short' }) : null}
            </DateTableElement>
          </TableRow>
        );
      })}
    </>
  );
};

type Props = {
  accountId: string;
};

const AccountActivityView: React.FC<Props> = ({ accountId }) => {
  const net = useNet();
  const query = useSWR(accountId ? ['explorer/activity', accountId, net] : null, () =>
    queryApi('/explorer/activity', { contractId: accountId, net }, false),
  );

  if (!accountId) {
    return <div>No account id</div>;
  }
  if (!query.data) {
    return <Spinner />;
  }

  return (
    <TableWrapper>
      <table>
        <TableHeader>
          <tr>
            <TableHeaderCell>Sender / Reciever</TableHeaderCell>
            <TableHeaderCell>Type</TableHeaderCell>
            <TableHeaderCell>Amount</TableHeaderCell>
            <TableHeaderCell>Id</TableHeaderCell>
            <TableHeaderCell>When</TableHeaderCell>
          </tr>
        </TableHeader>
        <tbody>
          {query.data.items.length === 0 ? 'No activity' : null}
          {query.data.items.map((item, index) => (
            <ActivityItemRow key={index} item={item} />
          ))}
        </tbody>
      </table>
    </TableWrapper>
  );
};

export default AccountActivityView;
