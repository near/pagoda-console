// Note: we use Joi instead of Nest's default recommendation of class-validator
// because class-validator was experiencing issues at the time of implementation
// and had many unaddressed github issues

import * as Joi from 'joi';
import { Api } from '@pc/common/types/api';

const netSchema = Joi.alternatives('MAINNET', 'TESTNET');

// activity
export const ActivityInputSchemas = Joi.object<
  Api.Query.Input<'/explorer/activity'>,
  true
>({
  net: netSchema,
  contractId: Joi.string(),
});
// transaction
export const TransactionInputSchemas = Joi.object<
  Api.Query.Input<'/explorer/transaction'>,
  true
>({
  net: netSchema,
  hash: Joi.string(),
});
// balance changes
export const BalanceChangesInputSchemas = Joi.object<
  Api.Query.Input<'/explorer/balanceChanges'>,
  true
>({
  net: netSchema,
  receiptId: Joi.string(),
  accountIds: Joi.array().items(Joi.string()),
});

export const GetTransactionsSchema = Joi.object<
  Api.Query.Input<'/explorer/getTransactions'>,
  true
>({
  contracts: Joi.array().items(Joi.string()),
  net: netSchema,
});
