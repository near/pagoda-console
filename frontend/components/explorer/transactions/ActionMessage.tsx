import type { Explorer } from '@pc/common/types/core';
import type * as RPC from '@pc/common/types/rpc';

import AccountLink from '../utils/AccountLink';
import Balance from '../utils/Balance';
import CodeArgs from '../utils/CodeArgs';

export interface Props<A extends RPC.ActionView> {
  actionKind: Explorer.Old.Action<A>['kind'];
  actionArgs: Explorer.Old.ActionArgs<A>;
  receiverId: string;
  showDetails?: boolean;
}

interface TransactionMessageRenderers {
  CreateAccount: React.FC<Props<'CreateAccount'>>;
  DeleteAccount: React.FC<Props<RPC.DeleteAccountActionView>>;
  DeployContract: React.FC<Props<RPC.DeployContractActionView>>;
  FunctionCall: React.FC<Props<RPC.FunctionCallActionView>>;
  Transfer: React.FC<Props<RPC.TransferActionView>>;
  Stake: React.FC<Props<RPC.StakeActionView>>;
  AddKey: React.FC<Props<RPC.AddKeyActionView>>;
  DeleteKey: React.FC<Props<RPC.DeleteKeyActionView>>;
}

const transactionMessageRenderers: TransactionMessageRenderers = {
  CreateAccount: ({ receiverId }: Props<'CreateAccount'>) => (
    <>
      <>New account created: </>
      <AccountLink accountId={receiverId} />
    </>
  ),
  DeleteAccount: ({ receiverId, actionArgs }: Props<RPC.DeleteAccountActionView>) => (
    <>
      <>Delete account </>
      <AccountLink accountId={receiverId} />
      <> and transfer remaining funds to </>
      <AccountLink accountId={actionArgs.beneficiary_id} />
    </>
  ),
  DeployContract: ({ receiverId }: Props<RPC.DeployContractActionView>) => (
    <>
      <>Contract deployed: </>
      <AccountLink accountId={receiverId} />
    </>
  ),
  FunctionCall: ({ receiverId, actionArgs, showDetails }: Props<RPC.FunctionCallActionView>) => {
    let args;
    if (showDetails) {
      if (typeof actionArgs.args === 'undefined') {
        args = <p>Loading...</p>;
      } else if ((typeof actionArgs.args === 'string' && actionArgs.args.length === 0) || !actionArgs.args) {
        args = <p>The arguments are empty</p>;
      } else {
        args = <CodeArgs args={actionArgs.args} />;
      }
    }
    return (
      <>
        <>{`Called method: ${actionArgs.method_name} in contract: `}</>
        <AccountLink accountId={receiverId} />
        {showDetails ? (
          <dl>
            <dt>
              <>Arguments:</>
            </dt>
            <dd>{args}</dd>
          </dl>
        ) : null}
      </>
    );
  },
  Transfer: ({ receiverId, actionArgs: { deposit } }: Props<RPC.TransferActionView>) => (
    <>
      <>Transferred </>
      <Balance amount={deposit} />
      <> to </>
      <AccountLink accountId={receiverId} />
    </>
  ),
  Stake: ({ actionArgs: { stake, public_key } }: Props<RPC.StakeActionView>) => (
    <>
      <>Staked: </>
      <Balance amount={stake} /> <>with ${public_key.substring(0, 15)}...</>
    </>
  ),
  AddKey: ({ receiverId, actionArgs }: Props<RPC.AddKeyActionView>) => (
    <>
      {typeof actionArgs.access_key.permission === 'object' ? (
        <>
          <>Access key added for contract </>
          <AccountLink accountId={actionArgs.access_key.permission.FunctionCall.receiver_id} />
          {`: ${actionArgs.public_key.substring(0, 15)}...`}
          <p>
            {`with permission to call ${
              actionArgs.access_key.permission.FunctionCall.method_names.length > 0
                ? `(${actionArgs.access_key.permission.FunctionCall.method_names.join(', ')})`
                : 'any'
            } methods`}
          </p>
        </>
      ) : (
        <>
          <>New key added for </>
          <AccountLink accountId={receiverId} />
          {`: ${actionArgs.public_key.substring(0, 15)}...`}
          <p>
            <>{`with permission ${actionArgs.access_key.permission}`}</>
          </p>
        </>
      )}
    </>
  ),
  DeleteKey: ({ actionArgs: { public_key } }: Props<RPC.DeleteKeyActionView>) => (
    <>{`Key deleted: ${public_key.substring(0, 15)}...`}</>
  ),
};

const ActionMessage = (props: Props<RPC.ActionView>) => {
  const MessageRenderer = transactionMessageRenderers[props.actionKind];
  if (MessageRenderer === undefined) {
    return (
      <>
        `${props.actionKind}: ${JSON.stringify(props.actionArgs)}`
      </>
    );
  }
  return <MessageRenderer {...(props as any)} showDetails={props.showDetails} />;
};

export default ActionMessage;
