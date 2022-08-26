import AccountLink from '../utils/AccountLink';
import Balance from '../utils/Balance';
import CodeArgs from '../utils/CodeArgs';
import type * as T from './types';

export interface Props<A> {
  actionKind: keyof TransactionMessageRenderers;
  actionArgs: A;
  receiverId: string;
  showDetails?: boolean;
}

type AnyAction =
  | T.CreateAccount
  | T.DeleteAccount
  | T.DeployContract
  | T.FunctionCall
  | T.Transfer
  | T.Stake
  | T.AddKey
  | T.DeleteKey;

interface TransactionMessageRenderers {
  CreateAccount: React.FC<Props<T.CreateAccount>>;
  DeleteAccount: React.FC<Props<T.DeleteAccount>>;
  DeployContract: React.FC<Props<T.DeployContract>>;
  FunctionCall: React.FC<Props<T.FunctionCall>>;
  Transfer: React.FC<Props<T.Transfer>>;
  Stake: React.FC<Props<T.Stake>>;
  AddKey: React.FC<Props<T.AddKey>>;
  DeleteKey: React.FC<Props<T.DeleteKey>>;
}

const transactionMessageRenderers: TransactionMessageRenderers = {
  CreateAccount: ({ receiverId }: Props<T.CreateAccount>) => (
    <>
      <>New account created: </>
      <AccountLink accountId={receiverId} />
    </>
  ),
  DeleteAccount: ({ receiverId, actionArgs }: Props<T.DeleteAccount>) => (
    <>
      <>Delete account </>
      <AccountLink accountId={receiverId} />
      <> and transfer remaining funds to </>
      <AccountLink accountId={actionArgs.beneficiary_id} />
    </>
  ),
  DeployContract: ({ receiverId }: Props<T.DeployContract>) => (
    <>
      <>Contract deployed: </>
      <AccountLink accountId={receiverId} />
    </>
  ),
  FunctionCall: ({ receiverId, actionArgs, showDetails }: Props<T.FunctionCall>) => {
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
  Transfer: ({ receiverId, actionArgs: { deposit } }: Props<T.Transfer>) => (
    <>
      <>Transferred </>
      <Balance amount={deposit} />
      <> to </>
      <AccountLink accountId={receiverId} />
    </>
  ),
  Stake: ({ actionArgs: { stake, public_key } }: Props<T.Stake>) => (
    <>
      <>Staked: </>
      <Balance amount={stake} /> <>with ${public_key.substring(0, 15)}...</>
    </>
  ),
  AddKey: ({ receiverId, actionArgs }: Props<T.AddKey>) => (
    <>
      {typeof actionArgs.access_key.permission === 'object' ? (
        actionArgs.access_key.permission.permission_kind ? (
          <>
            <>New key added for </>
            <AccountLink accountId={receiverId} />
            {`: ${actionArgs.public_key.substring(0, 15)}...`}
            <p>
              <>{`with permission ${actionArgs.access_key.permission.permission_kind}`}</>
            </p>
          </>
        ) : (
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
        )
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
  DeleteKey: ({ actionArgs: { public_key } }: Props<T.DeleteKey>) => (
    <>{`Key deleted: ${public_key.substring(0, 15)}...`}</>
  ),
};

const ActionMessage = (props: Props<AnyAction>) => {
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
