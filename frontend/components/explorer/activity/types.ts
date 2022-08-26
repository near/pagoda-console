type Action =
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

export type ActivityConnectionActions = {
  parentAction?: AccountActivityAction & ActivityConnection;
  childrenActions?: (AccountActivityAction & ActivityConnection)[];
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

export type AccountActivityAction = Action | AccountValidatorRewardAction | AccountBatchAction;

export type AccountActivityElement = {
  involvedAccountId: string | null;
  cursor: {
    blockTimestamp: string;
    shardId: number;
    indexInChunk: number;
  };
  timestamp: number;
  direction: 'inbound' | 'outbound';
  deltaAmount: string;
  action: AccountActivityAction & ActivityConnectionActions & Omit<ActivityConnection, 'sender' | 'receiver'>;
};
