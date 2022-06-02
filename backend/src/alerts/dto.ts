// Note: we use Joi instead of Nest's default recommendation of class-validator
// because class-validator was experiencing issues at the time of implementation
// and had many unaddressed github issues

import { AlertRuleType, NumberComparator, TxAction } from '.prisma/client';
import * as Joi from 'joi';

// create alert rule
interface CreateAlertRuleBaseDto {
  name?: string;
  type: AlertRuleType;
  contract: number;
  environment: number;
}
export interface CreateTxRuleDto {
  action?: TxAction;
}
export interface CreateTxRuleDto extends CreateAlertRuleBaseDto {
  txRule: CreateTxRuleDto;
}
export interface CreateFnCallRuleDto {
  function: string;
  // params?: object;
}
export interface CreateFnCallRuleDto extends CreateAlertRuleBaseDto {
  fnCallRule: CreateFnCallRuleDto;
}
export interface CreateEventRuleDto {
  standard: string;
  version: string;
  event: string;
  // data?: object;
}
export interface CreateEventRuleDto extends CreateAlertRuleBaseDto {
  eventRule: CreateEventRuleDto;
}
export interface CreateAcctBalRuleDto {
  comparator: NumberComparator;
  amount: number;
}
export interface CreateAcctBalRuleDto extends CreateAlertRuleBaseDto {
  acctBalRule: CreateAcctBalRuleDto;
}
export type CreateAlertRuleDto =
  | CreateTxRuleDto
  | CreateFnCallRuleDto
  | CreateEventRuleDto
  | CreateAcctBalRuleDto;
const CreateTxRuleSchema = Joi.object({
  action: Joi.string(),
});
const CreateFnCallRuleSchema = Joi.object({
  function: Joi.string().required(),
  // params: Joi.object(),
});
const CreateEventRuleSchema = Joi.object({
  standard: Joi.string().required(),
  version: Joi.string().required(),
  event: Joi.string().required(),
  // data: Joi.object(),
});
const CreateAcctBalRuleSchema = Joi.object({
  comparator: Joi.string()
    .allow('EQ', 'NEQ', 'LT', 'LTE', 'GT', 'GTE')
    .required(),
  amount: Joi.number().required(),
});
export const CreateAlertRuleSchema = Joi.object({
  name: Joi.string(),
  type: Joi.string()
    .allow(
      'TX_SUCCESS',
      'TX_FAILURE',
      'FN_CALL',
      'EVENT',
      'ACCT_BAL_PCT',
      'ACCT_BAL_NUM',
    )
    .required(),
  txRule: CreateTxRuleSchema.when('type', {
    is: ['TX_SUCCESS', 'TX_FAILURE'],
    then: Joi.required(),
    otherwise: Joi.disallow(),
  }),
  fnCallRule: CreateFnCallRuleSchema.when('type', {
    is: 'FN_CALL',
    then: Joi.required(),
    otherwise: Joi.disallow(),
  }),
  eventRule: CreateEventRuleSchema.when('type', {
    is: 'EVENT',
    then: Joi.required(),
    otherwise: Joi.disallow(),
  }),
  acctBalRule: CreateAcctBalRuleSchema.when('type', {
    is: ['ACCT_BAL_PCT', 'ACCT_BAL_NUM'],
    then: Joi.required(),
    otherwise: Joi.disallow(),
  }),
  contract: Joi.number().required(),
  environment: Joi.number().required(),
});

// list alert rules
export interface ListAlertRuleDto {
  environment: number;
}
export const ListAlertRuleSchema = Joi.object({
  environment: Joi.number().required(),
});

// delete alert rule
export interface DeleteAlertRuleDto {
  id: number;
}
export const DeleteAlertRuleSchema = Joi.object({
  id: Joi.number().required(),
});

// get alert rule details
export interface GetAlertRuleDetailsDto {
  id: number;
}
export const GetAlertRuleDetailsSchema = Joi.object({
  id: Joi.number().required(),
});
