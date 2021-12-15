import { PureComponent } from "react";
// import TransactionsApi, * as T from "../../libraries/explorer-wamp/transactions"; // TODO
import * as T from './types';

import TransactionLink from "../utils/TransactionLink";
import ActionGroup from "./ActionGroup";
import { ViewMode } from "./ActionRowBlock";
import TransactionExecutionStatus from "./TransactionExecutionStatus";

import { NetOption } from '../../../../utils/interfaces';
import Config from '../../../../utils/config';

// import { Translate } from "react-localize-redux";

import moment from 'moment';

export interface Props {
  transaction: T.Transaction;
  viewMode?: ViewMode;
  net: NetOption;
  finalityStatus?: FinalityStatus,
}

interface State {
  status?: T.ExecutionStatus;
}

class TransactionAction extends PureComponent<Props, State> {
  static defaultProps = {
    viewMode: "sparse",
  };

  state: State = {};

  componentDidMount() {
    this.fetchStatus();
  }

  fetchStatus = async () => {
    const status = await getTransactionStatus(
      this.props.transaction,
      this.props.net
    );
    this.setState({ status });
  };

  render() {
    const { transaction, viewMode, net } = this.props;
    const { status } = this.state;
    if (!transaction.actions) {
      return null;
    }
    return (
      <ActionGroup
        actionGroup={transaction as T.Transaction}
        detailsLink={<TransactionLink transactionHash={transaction.hash} net={net} />}
        status={
          status ? (
            <TransactionExecutionStatus status={status} />
          ) : (
            <>Fetching Status...</>
          )
        }
        viewMode={viewMode}
        title='Batch Transaction'
        finalityStatus={this.props.finalityStatus}
      />
    );
  }
}

// NOTE: this is a custom implementation for console. Explorer requests this status through
// its backend from dedicated archival nodes
import { TransactionInfo, ExecutionStatus } from './types';
import { FinalityStatus } from "../../../RecentTransactionList";
async function getTransactionStatus(transaction: TransactionInfo, net: NetOption, forceArchival?: boolean): Promise<any> {
  // TODO replace moment with a modern alternative for better web performance
  // https://momentjs.com/docs/#/-project-status/

  let rpcUrl;
  if (forceArchival) {
    console.log(`retrying: ${transaction.hash}`);
    // this is a retry, the default node returned UNKNOWN_TRANSACTION
    rpcUrl = Config.url.rpc.archival[net];
  } else {
    const blockMoment = moment(transaction.blockTimestamp);
    if (blockMoment.isBefore(moment().subtract(2.5, 'days'))) {
      // send to archival node. From the NEAR RPC docs:
      // > Querying historical data (older than 5 epochs or ~2.5 days), you
      // > may get responses that the data is not available anymore. In that
      // > case, archival RPC nodes will come to your rescue
      rpcUrl = Config.url.rpc.archival[net];
    } else {
      rpcUrl = Config.url.rpc.default[net];
    }
  }

  const res = await fetch(
    rpcUrl,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: "dontcare",
        method: "EXPERIMENTAL_tx_status",
        params: [
          transaction.hash,
          transaction.signerId,
        ],
      }),
    }
  ).then((res) => res.json());
  if (res.error && res.error.cause?.name === 'UNKNOWN_TRANSACTION') {
    // fallback to archival node
    return getTransactionStatus(transaction, net, true);
  } else if (res.error) {
    // general error
    // TODO (P2+) handle more elegantly
    throw new Error('Failed to fetch transaction status');
  }
  const transactionExtraInfo = res.result;
  const status = Object.keys(
    transactionExtraInfo.status
  )[0] as ExecutionStatus;
  return status;
}


export default TransactionAction;
