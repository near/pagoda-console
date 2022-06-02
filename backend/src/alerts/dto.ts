// Note: we use Joi instead of Nest's default recommendation of class-validator
// because class-validator was experiencing issues at the time of implementation
// and had many unaddressed github issues

import { AlertRuleType, NumberComparator, TxAction } from '.prisma/client';
import * as Joi from 'joi';

export interface TxRuleDto {
  action?: TxAction;
}
export interface FnCallRuleDto {
  function: string;
  // params?: object;
}
export interface EventRuleDto {
  standard: string;
  version: string;
  event: string;
  // data?: object;
}
export interface AcctBalRuleDto {
  comparator: NumberComparator;
  amount: number;
}

const TxRuleSchema = Joi.object({
  action: Joi.string(),
});
const FnCallRuleSchema = Joi.object({
  function: Joi.string().required(),
  // params: Joi.object(),
});
const EventRuleSchema = Joi.object({
  standard: Joi.string().required(),
  version: Joi.string().required(),
  event: Joi.string().required(),
  // data: Joi.object(),
});
const AcctBalRuleSchema = Joi.object({
  comparator: Joi.string()
    .valid('EQ', 'NEQ', 'LT', 'LTE', 'GT', 'GTE')
    .required(),
  amount: Joi.number().required(),
});

// create alert rule
interface CreateAlertRuleBaseDto {
  name?: string;
  type: AlertRuleType;
  contract: number;
  environment: number;
}
export interface CreateTxRuleDto extends CreateAlertRuleBaseDto {
  txRule: TxRuleDto;
}
export interface CreateFnCallRuleDto extends CreateAlertRuleBaseDto {
  fnCallRule: FnCallRuleDto;
}
export interface CreateEventRuleDto extends CreateAlertRuleBaseDto {
  eventRule: EventRuleDto;
}
export interface CreateAcctBalRuleDto extends CreateAlertRuleBaseDto {
  acctBalRule: AcctBalRuleDto;
}
export type CreateAlertRuleDto =
  | CreateTxRuleDto
  | CreateFnCallRuleDto
  | CreateEventRuleDto
  | CreateAcctBalRuleDto;
export const CreateAlertRuleSchema = Joi.object({
  name: Joi.string(),
  type: Joi.string()
    .valid(
      'TX_SUCCESS',
      'TX_FAILURE',
      'FN_CALL',
      'EVENT',
      'ACCT_BAL_PCT',
      'ACCT_BAL_NUM',
    )
    .required(),
  contract: Joi.number().required(),
  environment: Joi.number().required(),
  txRule: TxRuleSchema.when('type', {
    is: ['TX_SUCCESS', 'TX_FAILURE'],
    then: Joi.required(),
    otherwise: Joi.forbidden(),
  }),
  fnCallRule: FnCallRuleSchema.when('type', {
    is: 'FN_CALL',
    then: Joi.required(),
    otherwise: Joi.forbidden(),
  }),
  eventRule: EventRuleSchema.when('type', {
    is: 'EVENT',
    then: Joi.required(),
    otherwise: Joi.forbidden(),
  }),
  acctBalRule: AcctBalRuleSchema.when('type', {
    is: ['ACCT_BAL_PCT', 'ACCT_BAL_NUM'],
    then: Joi.required(),
    otherwise: Joi.forbidden(),
  }),
});

// update alert rule
interface UpdateAlertRuleBaseDto {
  id: number;
  name: string;
  type: AlertRuleType;
  description: string;
  isPaused: boolean;
  contract: number;
}
export interface UpdateTxRuleDto extends UpdateAlertRuleBaseDto {
  txRule: TxRuleDto;
}
export interface UpdateFnCallRuleDto extends UpdateAlertRuleBaseDto {
  fnCallRule: FnCallRuleDto;
}
export interface UpdateEventRuleDto extends UpdateAlertRuleBaseDto {
  eventRule: EventRuleDto;
}
export interface UpdateAcctBalRuleDto extends UpdateAlertRuleBaseDto {
  acctBalRule: AcctBalRuleDto;
}
export type UpdateAlertRuleDto =
  | UpdateTxRuleDto
  | UpdateFnCallRuleDto
  | UpdateEventRuleDto
  | UpdateAcctBalRuleDto;
export const UpdateAlertRuleSchema = Joi.object({
  id: Joi.string().required(),
  name: Joi.string().required(),
  description: Joi.string().required(),
  type: Joi.string()
    .valid(
      'TX_SUCCESS',
      'TX_FAILURE',
      'FN_CALL',
      'EVENT',
      'ACCT_BAL_PCT',
      'ACCT_BAL_NUM',
    )
    .required(),
  isPaused: Joi.boolean().required(),
  contract: Joi.number().required(),
  txRule: TxRuleSchema.when('type', {
    is: ['TX_SUCCESS', 'TX_FAILURE'],
    then: Joi.required(),
    otherwise: Joi.forbidden(),
  }),
  fnCallRule: FnCallRuleSchema.when('type', {
    is: 'FN_CALL',
    then: Joi.required(),
    otherwise: Joi.forbidden(),
  }),
  eventRule: EventRuleSchema.when('type', {
    is: 'EVENT',
    then: Joi.required(),
    otherwise: Joi.forbidden(),
  }),
  acctBalRule: AcctBalRuleSchema.when('type', {
    is: ['ACCT_BAL_PCT', 'ACCT_BAL_NUM'],
    then: Joi.required(),
    otherwise: Joi.forbidden(),
  }),
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
