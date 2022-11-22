import type { Explorer } from '@pc/common/types/core';

import type { MapDiscriminatedUnion } from '@/utils/types';

import AccountLink from '../utils/AccountLink';
import Balance from '../utils/Balance';
import CodeArgs from '../utils/CodeArgs';

export interface Props<K extends Explorer.Old.Action['kind']> {
  action: MapDiscriminatedUnion<Explorer.Old.Action, 'kind'>[K];
  receiverId: string;
  showDetails?: boolean;
}

interface TransactionMessageRenderers {
  CreateAccount: React.FC<Props<'CreateAccount'>>;
  DeleteAccount: React.FC<Props<'DeleteAccount'>>;
  DeployContract: React.FC<Props<'DeployContract'>>;
  FunctionCall: React.FC<Props<'FunctionCall'>>;
  Transfer: React.FC<Props<'Transfer'>>;
  Stake: React.FC<Props<'Stake'>>;
  AddKey: React.FC<Props<'AddKey'>>;
  DeleteKey: React.FC<Props<'DeleteKey'>>;
}

const transactionMessageRenderers: TransactionMessageRenderers = {
  CreateAccount: ({ receiverId }: Props<'CreateAccount'>) => (
    <>
      <>New account created: </>
      <AccountLink accountId={receiverId} />
    </>
  ),
  DeleteAccount: ({ receiverId, action }: Props<'DeleteAccount'>) => (
    <>
      <>Delete account </>
      <AccountLink accountId={receiverId} />
      <> and transfer remaining funds to </>
      <AccountLink accountId={action.args.beneficiary_id} />
    </>
  ),
  DeployContract: ({ receiverId }: Props<'DeployContract'>) => (
    <>
      <>Contract deployed: </>
      <AccountLink accountId={receiverId} />
    </>
  ),
  FunctionCall: ({ receiverId, action, showDetails }: Props<'FunctionCall'>) => {
    let args;
    if (showDetails) {
      if (typeof action.args.args === 'undefined') {
        args = <p>Loading...</p>;
      } else if ((typeof action.args.args === 'string' && action.args.args.length === 0) || !action.args.args) {
        args = <p>The arguments are empty</p>;
      } else {
        args = <CodeArgs args={action.args.args} />;
      }
    }
    return (
      <>
        <>{`Called method: ${action.args.method_name} in contract: `}</>
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
  Transfer: ({
    receiverId,
    action: {
      args: { deposit },
    },
  }: Props<'Transfer'>) => (
    <>
      <>Transferred </>
      <Balance amount={deposit} />
      <> to </>
      <AccountLink accountId={receiverId} />
    </>
  ),
  Stake: ({
    action: {
      args: { stake, public_key },
    },
  }: Props<'Stake'>) => (
    <>
      <>Staked: </>
      <Balance amount={stake} /> <>with ${public_key.substring(0, 15)}...</>
    </>
  ),
  AddKey: ({ receiverId, action }: Props<'AddKey'>) => (
    <>
      {typeof action.args.access_key.permission === 'object' ? (
        <>
          <>Access key added for contract </>
          <AccountLink accountId={action.args.access_key.permission.FunctionCall.receiver_id} />
          {`: ${action.args.public_key.substring(0, 15)}...`}
          <p>
            {`with permission to call ${
              action.args.access_key.permission.FunctionCall.method_names.length > 0
                ? `(${action.args.access_key.permission.FunctionCall.method_names.join(', ')})`
                : 'any'
            } methods`}
          </p>
        </>
      ) : (
        <>
          <>New key added for </>
          <AccountLink accountId={receiverId} />
          {`: ${action.args.public_key.substring(0, 15)}...`}
          <p>
            <>{`with permission ${action.args.access_key.permission}`}</>
          </p>
        </>
      )}
    </>
  ),
  DeleteKey: ({
    action: {
      args: { public_key },
    },
  }: Props<'DeleteKey'>) => <>{`Key deleted: ${public_key.substring(0, 15)}...`}</>,
};

const ActionMessage = (props: Props<Explorer.Old.Action['kind']>) => {
  const MessageRenderer = transactionMessageRenderers[props.action.kind];
  if (MessageRenderer === undefined) {
    return (
      <>
        `${props.action.kind}: ${JSON.stringify(props.action.args)}`
      </>
    );
  }
  return <MessageRenderer {...(props as any)} showDetails={props.showDetails} />;
};

export default ActionMessage;
