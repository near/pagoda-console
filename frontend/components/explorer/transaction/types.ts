export type TransactionStatus = 'unknown' | 'failure' | 'success';

type UnknownError = { type: 'unknown' };

type FunctionCallError =
  | {
      type: 'compilationError';
      error: CompilationError;
    }
  | { type: 'linkError'; msg: string }
  | { type: 'methodResolveError' }
  | { type: 'wasmTrap' }
  | { type: 'wasmUnknownError' }
  | { type: 'hostError' }
  | { type: 'evmError' }
  | { type: 'executionError'; error: string }
  | UnknownError;

type NewReceiptValidationError =
  | { type: 'invalidPredecessorId'; accountId: string }
  | { type: 'invalidReceiverId'; accountId: string }
  | { type: 'invalidSignerId'; accountId: string }
  | { type: 'invalidDataReceiverId'; accountId: string }
  | { type: 'returnedValueLengthExceeded'; length: number; limit: number }
  | {
      type: 'numberInputDataDependenciesExceeded';
      numberOfInputDataDependencies: number;
      limit: number;
    }
  | { type: 'actionsValidation' }
  | UnknownError;

type CompilationError =
  | { type: 'codeDoesNotExist'; accountId: string }
  | { type: 'prepareError' }
  | { type: 'wasmerCompileError'; msg: string }
  | { type: 'unsupportedCompiler'; msg: string }
  | UnknownError;

type ReceiptActionError =
  | {
      type: 'accountAlreadyExists';
      accountId: string;
    }
  | {
      type: 'accountDoesNotExist';
      accountId: string;
    }
  | {
      type: 'createAccountOnlyByRegistrar';
      accountId: string;
      registrarAccountId: string;
      predecessorId: string;
    }
  | {
      type: 'createAccountNotAllowed';
      accountId: string;
      predecessorId: string;
    }
  | {
      type: 'actorNoPermission';
      accountId: string;
      actorId: string;
    }
  | {
      type: 'deleteKeyDoesNotExist';
      accountId: string;
      publicKey: string;
    }
  | {
      type: 'addKeyAlreadyExists';
      accountId: string;
      publicKey: string;
    }
  | {
      type: 'deleteAccountStaking';
      accountId: string;
    }
  | {
      type: 'lackBalanceForState';
      accountId: string;
      amount: string;
    }
  | {
      type: 'triesToUnstake';
      accountId: string;
    }
  | {
      type: 'triesToStake';
      accountId: string;
      stake: string;
      locked: string;
      balance: string;
    }
  | {
      type: 'insufficientStake';
      accountId: string;
      stake: string;
      minimumStake: string;
    }
  | {
      type: 'functionCallError';
      error: FunctionCallError;
    }
  | {
      type: 'newReceiptValidationError';
      error: NewReceiptValidationError;
    }
  | { type: 'onlyImplicitAccountCreationAllowed'; accountId: string }
  | { type: 'deleteAccountWithLargeState'; accountId: string }
  | UnknownError;

type ReceiptTransactionError =
  | { type: 'invalidAccessKeyError' }
  | { type: 'invalidSignerId'; signerId: string }
  | { type: 'signerDoesNotExist'; signerId: string }
  | { type: 'invalidNonce'; transactionNonce: number; akNonce: number }
  | { type: 'nonceTooLarge'; transactionNonce: number; upperBound: number }
  | { type: 'invalidReceiverId'; receiverId: string }
  | { type: 'invalidSignature' }
  | {
      type: 'notEnoughBalance';
      signerId: string;
      balance: string;
      cost: string;
    }
  | { type: 'lackBalanceForState'; signerId: string; amount: string }
  | { type: 'costOverflow' }
  | { type: 'invalidChain' }
  | { type: 'expired' }
  | { type: 'actionsValidation' }
  | { type: 'transactionSizeExceeded'; size: number; limit: number }
  | UnknownError;

type ReceiptExecutionStatusError =
  | {
      type: 'action';
      error: ReceiptActionError;
    }
  | {
      type: 'transaction';
      error: ReceiptTransactionError;
    }
  | UnknownError;

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
