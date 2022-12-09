// import { Translate } from "react-localize-redux";
import type { Explorer } from '@pc/common/types/core';
import type * as RPC from '@pc/common/types/rpc';
import type { Net } from '@pc/database/clients/core';
import type JSBI from 'jsbi';
import { DateTime } from 'luxon';
import { useState } from 'react';

import { useRpc } from '@/hooks/rpc';

import { NetContext } from '../utils/NetContext';
import TransactionLink from '../utils/TransactionLink';
import ActionGroup from './ActionGroup';
import type { ViewMode } from './ActionRowBlock';
import TransactionExecutionStatus from './TransactionExecutionStatus';
// import TransactionsApi, * as T from "../../libraries/explorer-wamp/transactions"; // TODO

export interface Props {
  transaction: Explorer.Old.Transaction;
  viewMode?: ViewMode;
  net: Net;
  finalBlockTimestampNanosecond?: JSBI;
}

const TransactionAction = ({ transaction, viewMode = 'sparse', net, finalBlockTimestampNanosecond }: Props) => {
  const [archival, setArchival] = useState(() => {
    const blockDate = DateTime.fromMillis(transaction.blockTimestamp);
    const historicalDate = DateTime.now().minus({
      days: 2.5,
    });
    // send to archival node. From the NEAR RPC docs:
    // > Querying historical data (older than 5 epochs or ~2.5 days), you
    // > may get responses that the data is not available anymore. In that
    // > case, archival RPC nodes will come to your rescue
    return blockDate < historicalDate;
  });
  const statusQuery = useRpc(net, 'EXPERIMENTAL_tx_status', [transaction.hash, transaction.signerId], {
    retry: (failureCount, error) => {
      if ((error as any).cause?.name === 'UNKNOWN_TRANSACTION') {
        setArchival(true);
      }
      return failureCount < 2;
    },
    archival,
  });
  if (!transaction.actions) {
    return null;
  }
  const status =
    statusQuery.status === 'success'
      ? (Object.keys(statusQuery.data.status)[0] as keyof RPC.FinalExecutionStatus)
      : undefined;
  return (
    <>
      <ActionGroup
        actionGroup={transaction}
        detailsLink={
          <NetContext.Provider value={net}>
            <TransactionLink transactionHash={transaction.hash} />
          </NetContext.Provider>
        }
        status={status ? <TransactionExecutionStatus status={status} /> : <>Fetching Status...</>}
        viewMode={viewMode}
        title="Batch Transaction"
        finalBlockTimestampNanosecond={finalBlockTimestampNanosecond}
      />

      <style jsx global>
        {`
          .row {
            --bs-gutter-x: 1.5rem;
            --bs-gutter-y: 0;
            display: flex;
            flex-wrap: wrap;
            margin-top: calc(-1 * var(--bs-gutter-y));
            margin-right: calc(-0.5 * var(--bs-gutter-x));
            margin-left: calc(-0.5 * var(--bs-gutter-x));
          }

          .row > * {
            flex-shrink: 0;
            width: 100%;
            max-width: 100%;
            padding-right: calc(var(--bs-gutter-x) * 0.5);
            padding-left: calc(var(--bs-gutter-x) * 0.5);
            margin-top: var(--bs-gutter-y);
          }

          .text-right {
            text-align: right;
          }

          .col {
            flex: 1 0;
          }
          .col-auto {
            flex: 0 0 auto;
            width: auto;
          }
          .col-5 {
            flex: 0 0 auto;
            width: 41.66666667%;
          }
          .col-7 {
            flex: 0 0 auto;
            width: 58.33333333%;
          }
          .col-md-4 {
            flex: 0 0 auto;
            width: 33.33333333%;
          }
          .col-md-8 {
            flex: 0 0 auto;
            width: 66.66666667%;
          }

          .mx-0 {
            margin-right: 0 !important;
            margin-left: 0 !important;
          }
        `}
      </style>
    </>
  );
};

export default TransactionAction;
