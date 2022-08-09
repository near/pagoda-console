import JSBI from 'jsbi';
import { DateTime } from 'luxon';
import * as React from 'react';
import useSWR from 'swr';

import { Spinner } from '@/components/lib/Spinner';
import { Tooltip } from '@/components/lib/Tooltip';
import { styled } from '@/styles/stitches';
import * as BI from '@/utils/bigint';
import { shortenString } from '@/utils/formatting';
import { fetchGet } from '@/utils/http';
import type { NetOption } from '@/utils/types';

import Link from '../utils/Link';
import { NearAmount } from '../utils/NearAmount';
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
import type { AccountActivityAction, AccountActivityElement, ActivityConnectionActions } from './types';

type RowProps = {
  item: AccountActivityElement;
  net: NetOption;
};

const getActionLink = (net: NetOption, action: AccountActivityElement['action']) => {
  return 'blockHash' in action
    ? `https://explorer${net === 'TESTNET' ? '.testnet' : ''}.near.org/blocks/${action.blockHash}`
    : `https://explorer${net === 'TESTNET' ? '.testnet' : ''}.near.org/transactions/${action.transactionHash}${
        action.receiptId ? `#${action.receiptId}` : ''
      }`;
};

const getAccountLink = (net: NetOption, account: string) => {
  return `https://explorer${net === 'TESTNET' ? '.testnet' : ''}.near.org/accounts/${account}`;
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
  action: NonNullable<ActivityConnectionActions['parentAction']> | AccountActivityAction;
  net: NetOption;
}> = ({ action, net }) => {
  const badge = (
    <>
      {'sender' in action ? (
        <>
          <Tooltip content={action.sender}>
            <Link href={getAccountLink(net, action.sender)}>
              <a>{shortenString(action.sender)}</a>
            </Link>
          </Tooltip>
          {' → '}
        </>
      ) : null}
      <AccountActivityBadge
        action={action}
        href={'transactionHash' in action ? getActionLink(net, action) : undefined}
      />
      {'receiver' in action ? (
        <>
          {' → '}
          <Tooltip content={action.receiver}>
            <Link href={getAccountLink(net, action.receiver)}>
              <a>{shortenString(action.receiver)}</a>
            </Link>
          </Tooltip>
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

const ActivityItemRow: React.FC<RowProps> = ({ item, net }) => {
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
                      <Link href={getAccountLink(net, item.involvedAccountId)}>
                        <a>{shortenString(item.involvedAccountId)}</a>
                      </Link>
                    </Tooltip>
                  ) : (
                    'system'
                  )}
                </ActivityAccountName>
              ) : null}
            </TableElement>
            <TableElement>
              <ActivityItemAction net={net} action={subAction} />
              {item.action.parentAction ? (
                <>
                  <hr />
                  <ActivityItemTitle>Caused by receipt:</ActivityItemTitle>
                  <ActivityItemAction net={net} action={item.action.parentAction} />
                </>
              ) : null}
              {childrenActions.length !== 0 ? (
                <>
                  <hr />
                  <ActivityItemTitle>Children receipts:</ActivityItemTitle>
                  {childrenActions.map((childAction, index) => (
                    <ActivityItemAction key={index} net={net} action={childAction} />
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
                    <Link href={getActionLink(net, item.action)}>{shortenString(blockOrTransactionHash)}</Link>
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
  net: NetOption;
};

const AccountActivityView: React.FC<Props> = ({ accountId, net }) => {
  const query = useSWR<{ items: AccountActivityElement[] }>(
    accountId ? ['explorer/activity', accountId, net] : null,
    () => fetchGet(`/explorer/activity/?contractId=${accountId}&net=${net}`),
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
            <ActivityItemRow key={index} net={net} item={item} />
          ))}
        </tbody>
      </table>
    </TableWrapper>
  );
};

export default AccountActivityView;
