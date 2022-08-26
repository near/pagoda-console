import type { DurationLikeObject } from 'luxon';
import { Duration, Interval } from 'luxon';
import * as React from 'react';
import useSWR from 'swr';

import { H4 } from '@/components/lib/Heading';
import { Spinner } from '@/components/lib/Spinner';
import { useNet } from '@/hooks/net';
import { styled } from '@/styles/stitches';
import { unauthenticatedPost } from '@/utils/http';

import { Button } from '../../lib/Button';
import TransactionReceipt from './TransactionReceipt';
import type { Transaction } from './types';

type Props = {
  transactionHash: string | null;
};

const Wrapper = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
});

const TitleWrapper = styled('div', {
  display: 'flex',
  justifyContent: 'space-between',
  width: '100%',
  marginBottom: 30,
});

const TransactionActions: React.FC<Props> = React.memo(({ transactionHash }) => {
  const net = useNet();
  const query = useSWR<Transaction>(transactionHash ? ['explorer/transaction', transactionHash, net] : null, () =>
    unauthenticatedPost(`/explorer/transaction/`, { hash: transactionHash, net }),
  );

  if (!transactionHash) {
    return <div>No transaction hash</div>;
  }
  if (!query.data) {
    return <Spinner />;
  }
  return <TransactionActionsList transaction={query.data} />;
});

TransactionActions.displayName = 'TransactionActions';

type ListProps = {
  transaction: Transaction;
};

// see https://github.com/moment/luxon/issues/1134
const toHuman = (dur: Duration, smallestUnit: keyof DurationLikeObject = 'seconds'): string => {
  const units = [
    'years',
    'months',
    'days',
    'hours',
    'minutes',
    'seconds',
    'milliseconds',
  ] as (keyof DurationLikeObject)[];
  const smallestIdx = units.indexOf(smallestUnit);
  const entries = Object.entries(
    dur
      .shiftTo(...units)
      .normalize()
      .toObject(),
  ).filter(([_unit, amount], idx) => amount > 0 && idx <= smallestIdx);
  const dur2 = Duration.fromObject(entries.length === 0 ? { [smallestUnit]: 0 } : Object.fromEntries(entries));
  return dur2.toHuman();
};

const TransactionActionsList: React.FC<ListProps> = React.memo(({ transaction }) => {
  const [expanded, setExpanded] = React.useState(false);
  const expandAllReceipts = React.useCallback(() => setExpanded((x) => !x), [setExpanded]);

  const nestedReceipts = transaction.receipt.outcome.nestedReceipts;
  const pending = React.useMemo(
    () =>
      toHuman(
        Interval.fromDateTimes(
          new Date(transaction.timestamp),
          new Date(nestedReceipts.at(-1)?.outcome.block.timestamp ?? Infinity),
        ).toDuration(),
      ),
    [transaction.timestamp, nestedReceipts],
  );

  return (
    <Wrapper>
      <TitleWrapper>
        <div>
          <H4>Execution Plan</H4>
          <span>Processed in {pending}</span>
        </div>
        <Button size="s" onClick={expandAllReceipts}>
          {expanded ? 'Collapse all -' : 'Expand All + '}
        </Button>
      </TitleWrapper>
      <TransactionReceipt
        receipt={transaction.receipt}
        fellowOutgoingReceipts={[]}
        className=""
        convertionReceipt={true}
        expandAll={expanded}
      />
    </Wrapper>
  );
});

TransactionActionsList.displayName = 'TransactionActionsList';

export default TransactionActions;
