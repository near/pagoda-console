import { Net } from '@pc/database/clients/core';
import * as RPC from '../rpc';

export namespace Old {
  export type MapAction<K extends RPC.ActionView = RPC.ActionView> = {
    kind: K extends string ? K : keyof K;
    args: ActionArgs<K>;
  };

  export type Action =
    | MapAction<'CreateAccount'>
    | MapAction<RPC.DeployContractActionView>
    | MapAction<RPC.FunctionCallActionView>
    | MapAction<RPC.TransferActionView>
    | MapAction<RPC.StakeActionView>
    | MapAction<RPC.AddKeyActionView>
    | MapAction<RPC.DeleteKeyActionView>
    | MapAction<RPC.DeleteAccountActionView>;

  export type ActionArgs<K extends RPC.ActionView = RPC.ActionView> =
    K extends string ? {} : K[keyof K];

  export type Transaction = {
    hash: string;
    signerId: string;
    receiverId: string;
    blockHash: string;
    blockTimestamp: number;
    transactionIndex: number;
    actions: Action[];
  };
}

import { ReceiptExecutionStatusError } from './explorer-errors';
export * as Errors from './explorer-errors';

export type ReceiptExecutionStatus =
  | {
      type: 'failure';
      error: ReceiptExecutionStatusError;
    }
  | {
      type: 'successValue';
      value: string;
    }
  | {
      type: 'successReceiptId';
      receiptId: string;
    }
  | {
      type: 'unknown';
    };

export type Action =
  | {
      kind: 'createAccount';
      args: Record<string, never>;
    }
  | {
      kind: 'deployContract';
      args: {
        code: string;
      };
    }
  | {
      kind: 'functionCall';
      args: {
        methodName: string;
        args: string;
        gas: number;
        deposit: string;
      };
    }
  | {
      kind: 'transfer';
      args: {
        deposit: string;
      };
    }
  | {
      kind: 'stake';
      args: {
        stake: string;
        publicKey: string;
      };
    }
  | {
      kind: 'addKey';
      args: {
        publicKey: string;
        accessKey: {
          nonce: number;
          permission:
            | {
                type: 'fullAccess';
              }
            | {
                type: 'functionCall';
                contractId: string;
                methodNames: string[];
              };
        };
      };
    }
  | {
      kind: 'deleteKey';
      args: {
        publicKey: string;
      };
    }
  | {
      kind: 'deleteAccount';
      args: {
        beneficiaryId: string;
      };
    };

export type ActivityConnection = {
  transactionHash: string;
  receiptId?: string;
  sender: string;
  receiver: string;
};

type AccountBatchAction = {
  kind: 'batch';
  actions: AccountActivityAction[];
};

type AccountValidatorRewardAction = {
  kind: 'validatorReward';
  blockHash: string;
};

export type AccountActivityAction =
  | Action
  | AccountValidatorRewardAction
  | AccountBatchAction;

export type AccountActivityWithConnection = AccountActivityAction &
  ActivityConnection;

export type ActivityConnectionActions = {
  parentAction?: AccountActivityWithConnection;
  childrenActions?: AccountActivityWithConnection[];
};

export type ActivityActionItemAction = AccountActivityAction &
  ActivityConnectionActions &
  Omit<ActivityConnection, 'sender' | 'receiver'>;

export type ActivityActionItem = {
  involvedAccountId: string | null;
  timestamp: number;
  direction: 'inbound' | 'outbound';
  deltaAmount: string;
  action: ActivityActionItemAction;
};

export type AccountActivity = {
  items: ActivityActionItem[];
  cursor?: {
    blockTimestamp: string;
    shardId: number;
    indexInChunk: number;
  };
};

export type TransactionStatus = 'unknown' | 'failure' | 'success';

export type NestedReceiptWithOutcome = {
  id: string;
  predecessorId: string;
  receiverId: string;
  actions: Action[];
  outcome: {
    block: {
      hash: string;
      height: number;
      timestamp: number;
    };
    tokensBurnt: string;
    gasBurnt: number;
    status: ReceiptExecutionStatus;
    logs: string[];
    nestedReceipts: NestedReceiptWithOutcome[];
  };
};

export type Transaction = {
  hash: string;
  timestamp: number;
  signerId: string;
  receiverId: string;
  fee: string;
  amount: string;
  status: TransactionStatus;
  receipt: NestedReceiptWithOutcome;
};

export namespace Query {
  export namespace Inputs {
    export type Activity = { contractId: string; net: Net };
    export type BalanceChanges = {
      net: Net;
      receiptId: string;
      accountIds: string[];
    };
    export type GetTransaction = { net: Net; hash: string };
    export type GetTransactions = { net: Net; contracts: string[] };
  }

  export namespace Outputs {
    export type Activity = { items: ActivityActionItem[] };
    export type BalanceChanges = (string | null)[];
    export type GetTransaction = Transaction;
    export type GetTransactions = (Old.Transaction & {
      sourceContract: string;
    })[];
  }

  export namespace Errors {
    export type Activity = unknown;
    export type BalanceChanges = unknown;
    export type GetTransaction = unknown;
    export type GetTransactions = unknown;
  }
}
