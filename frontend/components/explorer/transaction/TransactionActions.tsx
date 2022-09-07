import type { DurationLikeObject } from 'luxon';
import { Duration, Interval } from 'luxon';
import * as React from 'react';
import useSWR from 'swr';
import type { BareFetcher, PublicConfiguration, Revalidator, RevalidatorOptions } from 'swr/dist/types';

import { Flex } from '@/components/lib/Flex';
import { H4 } from '@/components/lib/Heading';
import { Placeholder } from '@/components/lib/Placeholder';
import { Spinner } from '@/components/lib/Spinner';
import { Text } from '@/components/lib/Text';
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

// Differs from the global error retry by retrying on 400 errors.
function customErrorRetry(
  err: any,
  __: string,
  config: Readonly<PublicConfiguration<Transaction, any, BareFetcher<Transaction>>>,
  revalidate: Revalidator,
  opts: Required<RevalidatorOptions>,
): void {
  switch (err.statusCode) {
    case 401:
    case 403:
    case 404:
      console.log(`breaking for status code of ${err.status}`);
      return;
  }

  const maxRetryCount = config.errorRetryCount;
  const currentRetryCount = opts.retryCount;

  const timeout = ~~((Math.random() + 0.5) * (1 << (currentRetryCount < 8 ? currentRetryCount : 8))) + 1500;

  if (maxRetryCount !== undefined && currentRetryCount > maxRetryCount) {
    return;
  }

  setTimeout(revalidate, timeout, opts);
}

const TransactionActions: React.FC<Props> = React.memo(({ transactionHash }) => {
  const net = useNet();

  const query = useSWR<Transaction>(
    transactionHash ? ['explorer/transaction', transactionHash, net] : null,
    () => unauthenticatedPost(`/explorer/transaction/`, { hash: transactionHash, net }),
    {
      onErrorRetry: customErrorRetry,
      // TODO currently this is a quick hack to load TXs that may have pending receipts that are scheduled to execute in the next block. We could stop refreshing once we get the last receipt's execution outcome timestamp.
      refreshInterval: 3000,
    },
  );

  if (!transactionHash) {
    return <div>No transaction hash</div>;
  }
  if (!query.data) {
    return (
      <Flex stack gap="l" align="center">
        <Spinner center />
        <Text>Loading Transaction (this could take a few seconds)</Text>
      </Flex>
    );
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
  const pending = React.useMemo(() => {
    const completedTimestamp = nestedReceipts.at(-1)?.outcome?.block?.timestamp;
    if (!completedTimestamp) {
      return <Placeholder css={{ display: 'inline-block', width: '8rem' }} />;
    }
    return toHuman(Interval.fromDateTimes(new Date(transaction.timestamp), new Date(completedTimestamp)).toDuration());
  }, [transaction.timestamp, nestedReceipts]);

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
