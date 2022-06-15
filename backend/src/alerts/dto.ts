// Note: we use Joi instead of Nest's default recommendation of class-validator
// because class-validator was experiencing issues at the time of implementation
// and had many unaddressed github issues

import {
  RuleType,
  NumberComparator,
  TxAction,
  Net,
} from '../../modules/alerts/prisma/generated';
import * as Joi from 'joi';

export interface TxRuleDto {
  contract: string;
  action?: TxAction;
}
export interface FnCallRuleDto {
  contract: string;
  function: string;
  // params?: object;
}
export interface EventRuleDto {
  contract: string;
  standard: string;
  version: string;
  event: string;
  // data?: object;
}
export interface AcctBalRuleDto {
  contract: string;
  comparator: NumberComparator;
  amount: number;
}

const TxRuleSchema = Joi.object({
  contract: Joi.string().required(),
  action: Joi.string().valid(
    'CREATE_ACCOUNT',
    'DEPLOY_CONTRACT',
    'FUNCTION_CALL',
    'TRANSFER',
    'STAKE',
    'ADD_KEY',
    'DELETE_KEY',
    'DELETE_ACCOUNT',
  ),
});
const FnCallRuleSchema = Joi.object({
  contract: Joi.string().required(),
  function: Joi.string().required(),
  // params: Joi.object(),
});
const EventRuleSchema = Joi.object({
  contract: Joi.string().required(),
  standard: Joi.string().required(),
  version: Joi.string().required(),
  event: Joi.string().required(),
  // data: Joi.object(),
});
const AcctBalRuleSchema = Joi.object({
  contract: Joi.string().required(),
  comparator: Joi.string()
    .valid('EQ', 'NEQ', 'LT', 'LTE', 'GT', 'GTE')
    .required(),
  amount: Joi.number().required(),
});

// create alert
interface CreateAlertBaseDto {
  name?: string;
  type: RuleType;
  projectSlug: string;
  environmentSubId: number;
  net: Net;
  webhookDestinations?: Array<number>;
}
export interface CreateTxAlertDto extends CreateAlertBaseDto {
  txRule: TxRuleDto;
}
export interface CreateFnCallAlertDto extends CreateAlertBaseDto {
  fnCallRule: FnCallRuleDto;
}
export interface CreateEventAlertDto extends CreateAlertBaseDto {
  eventRule: EventRuleDto;
}
export interface CreateAcctBalAlertDto extends CreateAlertBaseDto {
  acctBalRule: AcctBalRuleDto;
}
export type CreateAlertDto =
  | CreateTxAlertDto
  | CreateFnCallAlertDto
  | CreateEventAlertDto
  | CreateAcctBalAlertDto;
export const CreateAlertSchema = Joi.object({
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
  projectSlug: Joi.string().required(),
  environmentSubId: Joi.number().required(),
  net: Joi.string().valid('TESTNET', 'MAINNET').required(),
  webhookDestinations: Joi.array().items(Joi.number()).optional(),
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

// update alert
export interface UpdateAlertDto {
  id: number;
  name: string;
  isPaused: boolean;
}
export const UpdateAlertSchema = Joi.object({
  id: Joi.number().required(),
  name: Joi.string().required(),
  isPaused: Joi.boolean().required(),
});

// list alerts
export interface ListAlertDto {
  projectSlug: string;
  environmentSubId: number;
}
export const ListAlertSchema = Joi.object({
  projectSlug: Joi.string().required(),
  environmentSubId: Joi.number().required(),
});

// delete alert
export interface DeleteAlertDto {
  id: number;
}
export const DeleteAlertSchema = Joi.object({
  id: Joi.number().required(),
});

// get alert details
export interface GetAlertDetailsDto {
  id: number;
}
export const GetAlertDetailsSchema = Joi.object({
  id: Joi.number().required(),
});

// create webhook destination
export interface CreateWebhookDestinationDto {
  name?: string;
  url: string;
  project: string;
}
export const CreateWebhookDestinationSchema = Joi.object({
  name: Joi.string().optional(),
  url: Joi.string().required(),
  project: Joi.string().required(),
});

// list webhook destinations
export interface ListWebhookDestinationDto {
  project: string;
}
export const ListWebhookDestinationSchema = Joi.object({
  project: Joi.string().required(),
});
