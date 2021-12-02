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
    const { transaction, viewMode } = this.props;
    const { status } = this.state;
    if (!transaction.actions) {
      return null;
    }
    return (
      <ActionGroup
        actionGroup={transaction as T.Transaction}
        detailsLink={<TransactionLink transactionHash={transaction.hash} />}
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

// TODO: this is custom -mp
import { TransactionInfo, ExecutionStatus } from './types';
import { FinalityStatus } from "../../../RecentTransactionList";
async function getTransactionStatus(transaction: TransactionInfo, net: NetOption): Promise<any> {
  const res = await fetch(
    // TODO change from locking into archival
    net === "MAINNET" ? Config.url.rpc.mainnet : Config.url.rpc.testnetArchival,
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
  if (res.error) {
    // TODO decide whether to retry error
    throw new Error(res.error.name);
  }
  const transactionExtraInfo = res.result;
  // debugger;
  const status = Object.keys(
    transactionExtraInfo.status
  )[0] as ExecutionStatus;
  return status;
}

export default TransactionAction;
