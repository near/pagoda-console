import { z } from 'zod';
import * as Errors from './explorer-errors';
import {
  net,
  accountId,
  receiptId,
  transactionHash,
  yoctoNear,
  blockHash,
  transactionStatus,
} from './types';

const oldAction = z.discriminatedUnion('kind', [
  z.strictObject({
    kind: z.literal('CreateAccount'),
    args: z.strictObject({}),
  }),
  z.strictObject({
    kind: z.literal('DeployContract'),
    args: z.strictObject({
      code: z.string(),
    }),
  }),
  z.strictObject({
    kind: z.literal('FunctionCall'),
    args: z.strictObject({
      method_name: z.string(),
      args: z.string(),
      gas: z.number(),
      deposit: yoctoNear,
    }),
  }),
  z.strictObject({
    kind: z.literal('Transfer'),
    args: z.strictObject({
      deposit: yoctoNear,
    }),
  }),
  z.strictObject({
    kind: z.literal('Stake'),
    args: z.strictObject({
      stake: yoctoNear,
      public_key: z.string(),
    }),
  }),
  z.strictObject({
    kind: z.literal('AddKey'),
    args: z.strictObject({
      public_key: z.string(),
      access_key: z.strictObject({
        nonce: z.number(),
        permission: z.union([
          z.strictObject({
            FunctionCall: z.strictObject({
              allowance: yoctoNear.optional(),
              receiver_id: accountId,
              method_names: z.array(z.string()),
            }),
          }),
          z.literal('FullAccess'),
        ]),
      }),
    }),
  }),
  z.strictObject({
    kind: z.literal('DeleteKey'),
    args: z.strictObject({
      public_key: z.string(),
    }),
  }),
  z.strictObject({
    kind: z.literal('DeleteAccount'),
    args: z.strictObject({
      beneficiary_id: accountId,
    }),
  }),
]);

const old = {
  action: oldAction,
  transaction: z.strictObject({
    hash: transactionHash,
    signerId: accountId,
    receiverId: accountId,
    blockHash,
    blockTimestamp: z.number(),
    transactionIndex: z.number(),
    actions: oldAction.array(),
  }),
};

export namespace Old {
  export type Action = z.infer<typeof old.action>;
  export type Transaction = z.infer<typeof old.transaction>;
}

export { Errors };

const primitiveAction = z.discriminatedUnion('kind', [
  z.strictObject({
    kind: z.literal('createAccount'),
    args: z.strictObject({}),
  }),
  z.strictObject({
    kind: z.literal('deployContract'),
    args: z.strictObject({
      code: z.string(),
    }),
  }),
  z.strictObject({
    kind: z.literal('functionCall'),
    args: z.strictObject({
      methodName: z.string(),
      args: z.string(),
      gas: z.number(),
      deposit: yoctoNear,
    }),
  }),
  z.strictObject({
    kind: z.literal('transfer'),
    args: z.strictObject({
      deposit: yoctoNear,
    }),
  }),
  z.strictObject({
    kind: z.literal('stake'),
    args: z.strictObject({
      stake: yoctoNear,
      publicKey: z.string(),
    }),
  }),
  z.strictObject({
    kind: z.literal('addKey'),
    args: z.strictObject({
      publicKey: z.string(),
      accessKey: z.strictObject({
        nonce: z.number(),
        permission: z.discriminatedUnion('type', [
          z.strictObject({
            type: z.literal('fullAccess'),
          }),
          z.strictObject({
            type: z.literal('functionCall'),
            contractId: accountId,
            methodNames: z.array(z.string()),
          }),
        ]),
      }),
    }),
  }),
  z.strictObject({
    kind: z.literal('deleteKey'),
    args: z.strictObject({
      publicKey: z.string(),
    }),
  }),
  z.strictObject({
    kind: z.literal('deleteAccount'),
    args: z.strictObject({
      beneficiaryId: accountId,
    }),
  }),
]);

export type Action = z.infer<typeof primitiveAction>;

const validatorRewardAction = z.strictObject({
  kind: z.literal('validatorReward'),
  blockHash,
});

export type AccountActivityAction =
  | z.infer<typeof validatorRewardAction>
  | z.infer<typeof primitiveAction>
  | {
      kind: 'batch';
      actions: AccountActivityAction[];
    };

const accountActivityAction: z.ZodType<AccountActivityAction> = z.lazy(() =>
  z.union([
    // see https://github.com/colinhacks/zod/issues/1500
    primitiveAction as z.ZodType<z.infer<typeof primitiveAction>>,
    validatorRewardAction as unknown as z.ZodType<
      z.infer<typeof validatorRewardAction>
    >,
    z.strictObject({
      kind: z.literal('batch'),
      actions: z.array(accountActivityAction),
    }),
  ]),
);

const activityConnection = z.strictObject({
  transactionHash,
  receiptId: receiptId.optional(),
  sender: accountId,
  receiver: accountId,
});
export type ActivityConnection = z.infer<typeof activityConnection>;

const accountActivityWithConnection =
  accountActivityAction.and(activityConnection);
export type AccountActivityWithConnection = z.infer<
  typeof accountActivityWithConnection
>;

const activityConnectionActions = z.strictObject({
  parentAction: accountActivityWithConnection.optional(),
  childrenActions: z.array(accountActivityWithConnection).optional(),
});

const receiptExecutionStatus = z.discriminatedUnion('type', [
  z.strictObject({
    type: z.literal('failure'),
    error: Errors.receiptExecutionStatusError,
  }),
  z.strictObject({ type: z.literal('successValue'), value: z.string() }),
  z.strictObject({ type: z.literal('successReceiptId'), receiptId }),
  Errors.unknownError,
]);
export type ReceiptExecutionStatus = z.infer<typeof receiptExecutionStatus>;

const nestedReceiptOutcomeBase = z.strictObject({
  block: z.strictObject({
    hash: blockHash,
    height: z.number(),
    timestamp: z.number(),
  }),
  tokensBurnt: yoctoNear,
  gasBurnt: z.number(),
  status: receiptExecutionStatus,
  logs: z.array(z.string()),
});

const nestedReceiptWithOutcomeBase = z.strictObject({
  id: receiptId,
  predecessorId: accountId,
  receiverId: accountId,
  actions: z.array(primitiveAction),
});

export type NestedReceiptWithOutcome = z.infer<
  typeof nestedReceiptWithOutcomeBase
> & {
  outcome: z.infer<typeof nestedReceiptOutcomeBase> & {
    nestedReceipts: NestedReceiptWithOutcome[];
  };
};

const nestedReceiptWithOutcome: z.ZodType<NestedReceiptWithOutcome> = z.lazy(
  () =>
    // see https://github.com/colinhacks/zod/issues/1500
    (
      nestedReceiptWithOutcomeBase as unknown as z.ZodType<
        z.infer<typeof nestedReceiptWithOutcomeBase>
      >
    ).and(
      z.strictObject({
        outcome: (
          nestedReceiptOutcomeBase as unknown as z.ZodType<
            z.infer<typeof nestedReceiptOutcomeBase>
          >
        ).and(
          z.strictObject({
            nestedReceipts: z.array(nestedReceiptWithOutcome),
          }),
        ),
      }),
    ),
);

const activityActionItemAction = accountActivityAction
  .and(activityConnectionActions)
  .and(
    activityConnection.omit({
      sender: true,
      receiver: true,
    }),
  );

export type ActivityActionItemAction = z.infer<typeof activityActionItemAction>;

const activityActionItem = z.strictObject({
  involvedAccountId: accountId.or(z.null()),
  timestamp: z.number(),
  direction: z.enum(['inbound', 'outbound']),
  deltaAmount: yoctoNear,
  action: activityActionItemAction,
});
export type ActivityActionItem = z.infer<typeof activityActionItem>;

const transaction = z.strictObject({
  hash: transactionHash,
  timestamp: z.number(),
  signerId: accountId,
  receiverId: accountId,
  fee: yoctoNear,
  amount: yoctoNear,
  status: transactionStatus,
  receipt: nestedReceiptWithOutcome,
});
export type Transaction = z.infer<typeof transaction>;

const accountActivity = z.strictObject({
  items: z.array(activityActionItem),
  cursor: z
    .strictObject({
      blockTimestamp: z.string(),
      shardId: z.number(),
      indexInChunk: z.number(),
    })
    .optional(),
});
export type AccountActivity = z.infer<typeof accountActivity>;

export const query = {
  inputs: {
    activity: z.strictObject({
      net,
      contractId: accountId,
    }),
    balanceChanges: z.strictObject({
      net,
      receiptId,
      accountIds: z.array(accountId),
    }),
    transaction: z.strictObject({
      net,
      hash: transactionHash,
    }),
    getTransactions: z.strictObject({
      net,
      contracts: z.array(accountId),
    }),
  },

  outputs: {
    activity: accountActivity,
    balanceChanges: z.array(z.string().or(z.null())),
    transaction,
    getTransactions: old.transaction
      .merge(z.strictObject({ sourceContract: accountId }))
      .array(),
  },

  errors: {
    activity: z.unknown(),
    balanceChanges: z.unknown(),
    transaction: z.unknown(),
    getTransactions: z.unknown(),
  },
};

export type {
  TransactionStatus,
  AccountId,
  TransactionHash,
  ReceiptId,
  YoctoNear,
  BlockHash,
} from './types';
