// Note: we use Joi instead of Nest's default recommendation of class-validator
// because class-validator was experiencing issues at the time of implementation
// and had many unaddressed github issues

import * as Joi from 'joi';
import { Net } from 'pagoda-console-database/clients/core';

// activity
export type ActivityInputDto = {
  net: Net;
  contractId: string;
};
export const ActivityInputSchemas = Joi.object({
  net: Joi.string(),
  contractId: Joi.string(),
});
// transaction
export type TransactionInputDto = {
  net: Net;
  hash: string;
};
export const TransactionInputSchemas = Joi.object({
  net: Joi.string(),
  hash: Joi.string(),
});
// balance changes
export type BalanceChangesInputDto = {
  net: Net;
  receiptId: string;
  accountIds: string[];
};
export const BalanceChangesInputSchemas = Joi.object({
  net: Joi.string(),
  receiptId: Joi.string(),
  accountIds: Joi.array().items(Joi.string()),
});
