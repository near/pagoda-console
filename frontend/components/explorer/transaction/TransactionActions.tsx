import type { Explorer } from '@pc/common/types/core';
import type { DurationLikeObject } from 'luxon';
import { Duration, Interval } from 'luxon';
import * as React from 'react';
import useSWR from 'swr';

import { Flex } from '@/components/lib/Flex';
import { H4 } from '@/components/lib/Heading';
import { Placeholder } from '@/components/lib/Placeholder';
import { Spinner } from '@/components/lib/Spinner';
import { Text } from '@/components/lib/Text';
import { useNet } from '@/hooks/net';
import { api } from '@/utils/api';
import { getCustomErrorRetry } from '@/utils/query';
import { StableId } from '@/utils/stable-ids';

import { Button } from '../../lib/Button';
import TransactionReceipt from './TransactionReceipt';

type Props = {
  transactionHash: string | null;
};

type ToggleReceipt = {
  id: string;
  active: boolean;
};

type TransactionReceiptContext = {
  selectedReceipts: ToggleReceipt[];
  toggleReceipts: (id: string) => void;
};

const TransactionActions: React.FC<Props> = React.memo(({ transactionHash }) => {
  const net = useNet();

  const query = useSWR(
    transactionHash ? ['/explorer/transaction' as const, transactionHash, net] : null,
    (path, hash, net) => {
      return api.query(path, { hash, net }, false);
    },
    {
      onErrorRetry: getCustomErrorRetry([401, 403, 404]),
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
  transaction: Explorer.Transaction;
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

export const TransactionReceiptContext = React.createContext<TransactionReceiptContext>({
  selectedReceipts: [],
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  toggleReceipts: () => {},
});

const TransactionActionsList: React.FC<ListProps> = React.memo(({ transaction }) => {
  const preCollectedReceipts = React.useMemo(() => {
    const receipts = [] as ToggleReceipt[];
    const collectReceiptHashes: any = (receipt: Explorer.Transaction['receipt']) => {
      const id = receipt.id;
      receipts.push({ id, active: false });
      return receipt.outcome.nestedReceipts
        .filter((receipt) => receipt.predecessorId !== 'system')
        .map(collectReceiptHashes);
    };
    collectReceiptHashes(transaction.receipt);
    return receipts;
  }, [transaction.receipt]);

  const [activeReceipts, setActiveReceipts] = React.useState(preCollectedReceipts);

  const [toggleType, setToggleType] = React.useState<'toggle' | 'collapse'>('collapse');
  const toggleAllReceipts = React.useCallback(() => {
    setToggleType((prevType) => (prevType === 'collapse' ? 'toggle' : 'collapse'));
    const receipts = activeReceipts.map((i) => {
      switch (toggleType) {
        case 'collapse':
          return { id: i.id, active: true };
        case 'toggle':
          return { id: i.id, active: false };
      }
    });
    setActiveReceipts(receipts);
  }, [activeReceipts, toggleType]);

  const pending = React.useMemo(() => {
    const completedTimestamp = transaction.receipt?.outcome?.block?.timestamp;
    if (!completedTimestamp) {
      return <Placeholder css={{ display: 'inline-block', width: '8rem' }} />;
    }
    return toHuman(Interval.fromDateTimes(new Date(transaction.timestamp), new Date(completedTimestamp)).toDuration());
  }, [transaction.timestamp, transaction.receipt]);

  const toggleReceipts = (id: string) => {
    setActiveReceipts((prevState) => {
      const index = prevState.findIndex((i) => i.id === id);
      if (index >= 0) {
        const newObj = { id, active: !prevState[index].active };
        const rest = prevState.filter((i) => i.id !== id);
        const updatedObj = [...rest, newObj];

        const allExpanded = activeReceipts.every((i) => i.active === true);
        const allCollapsed = activeReceipts.every((i) => i.active === false);

        if (allCollapsed) {
          setToggleType('toggle');
        } else if (allExpanded) {
          setToggleType('collapse');
        }
        return updatedObj;
      } else {
        return [...prevState, { id, active: true }];
      }
    });
  };

  return (
    <TransactionReceiptContext.Provider value={{ selectedReceipts: activeReceipts, toggleReceipts }}>
      <Flex stack gap="l">
        <Flex justify="spaceBetween">
          <div>
            <H4>Execution Plan</H4>
            <span>Processed in {pending === '0 seconds' ? '< 1 second' : pending}</span>
          </div>

          <Button stableId={StableId.TRANSACTION_ACTIONS_RESPONSE_EXPAND_BUTTON} size="s" onClick={toggleAllReceipts}>
            {toggleType === 'toggle' ? 'Collapse all -' : 'Expand All + '}
          </Button>
        </Flex>

        <TransactionReceipt
          receipt={transaction.receipt}
          fellowOutgoingReceipts={[]}
          className=""
          convertionReceipt={true}
        />
      </Flex>
    </TransactionReceiptContext.Provider>
  );
});

TransactionActionsList.displayName = 'TransactionActionsList';

export default TransactionActions;
