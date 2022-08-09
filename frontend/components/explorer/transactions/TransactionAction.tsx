// import { Translate } from "react-localize-redux";
import { DateTime } from 'luxon';
import { PureComponent } from 'react';

import config from '@/utils/config';
import type { NetOption } from '@/utils/types';

import TransactionLink from '../utils/TransactionLink';
import ActionGroup from './ActionGroup';
import type { ViewMode } from './ActionRowBlock';
import TransactionExecutionStatus from './TransactionExecutionStatus';
// import TransactionsApi, * as T from "../../libraries/explorer-wamp/transactions"; // TODO
import type * as T from './types';

export interface Props {
  transaction: T.Transaction;
  viewMode?: ViewMode;
  net: NetOption;
  finalityStatus?: FinalityStatus;
}

interface State {
  status?: T.ExecutionStatus;
}

class TransactionAction extends PureComponent<Props, State> {
  static defaultProps = {
    viewMode: 'sparse',
  };

  state: State = {};

  componentDidMount() {
    this.fetchStatus();
  }

  fetchStatus = async () => {
    const status = await getTransactionStatus(this.props.transaction, this.props.net);
    this.setState({ status });
  };

  render() {
    const { transaction, viewMode, net } = this.props;
    const { status } = this.state;
    if (!transaction.actions) {
      return null;
    }
    return (
      <>
        <ActionGroup
          actionGroup={transaction as T.Transaction}
          detailsLink={
            <NetContext.Provider value={net}>
              <TransactionLink transactionHash={transaction.hash} />
            </NetContext.Provider>
          }
          status={status ? <TransactionExecutionStatus status={status} /> : <>Fetching Status...</>}
          viewMode={viewMode}
          title="Batch Transaction"
          finalityStatus={this.props.finalityStatus}
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
  }
}

// NOTE: this is a custom implementation for console. Explorer requests this status through
// its backend from dedicated archival nodes
import type { FinalityStatus } from '@/utils/types';

import { NetContext } from '../utils/NetContext';
import type { ExecutionStatus, TransactionInfo } from './types';
async function getTransactionStatus(
  transaction: TransactionInfo,
  net: NetOption,
  forceArchival?: boolean,
): Promise<any> {
  let rpcUrl;
  if (forceArchival) {
    console.log(`retrying: ${transaction.hash}`);
    // this is a retry, the default node returned UNKNOWN_TRANSACTION
    rpcUrl = config.url.rpc.archival[net];
  } else {
    const blockDate = DateTime.fromMillis(transaction.blockTimestamp);
    const historicalDate = DateTime.now().minus({
      days: 2.5,
    });

    if (blockDate < historicalDate) {
      // send to archival node. From the NEAR RPC docs:
      // > Querying historical data (older than 5 epochs or ~2.5 days), you
      // > may get responses that the data is not available anymore. In that
      // > case, archival RPC nodes will come to your rescue
      rpcUrl = config.url.rpc.archival[net];
    } else {
      rpcUrl = config.url.rpc.default[net];
    }
  }

  const res = await fetch(rpcUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 'dontcare',
      method: 'EXPERIMENTAL_tx_status',
      params: [transaction.hash, transaction.signerId],
    }),
  }).then((res) => res.json());
  if (res.error && res.error.cause?.name === 'UNKNOWN_TRANSACTION' && !forceArchival) {
    // fallback to archival node
    return getTransactionStatus(transaction, net, true);
  } else if (res.error) {
    // general error
    // TODO (P2+) handle more elegantly
    throw new Error('Failed to fetch transaction status');
  }
  const transactionExtraInfo = res.result;
  const status = Object.keys(transactionExtraInfo.status)[0] as ExecutionStatus;
  return status;
}

export default TransactionAction;
