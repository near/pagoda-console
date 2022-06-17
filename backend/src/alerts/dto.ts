// Note: we use Joi instead of Nest's default recommendation of class-validator
// because class-validator was experiencing issues at the time of implementation
// and had many unaddressed github issues

import * as Joi from 'joi';
import {
  AcctBalRuleDto,
  EventRuleDto,
  FnCallRuleDto,
  RuleType,
  TxRuleDto,
} from './serde/dto.types';

const TxRuleSchema = Joi.object({
  contract: Joi.string().required(),
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
  webhookDestinations?: Array<number>;
}
export interface CreateTxAlertDto extends CreateAlertBaseDto {
  type: 'TX_SUCCESS' | 'TX_FAILURE';
  rule: TxRuleDto;
}
export interface CreateFnCallAlertDto extends CreateAlertBaseDto {
  type: 'FN_CALL';
  rule: FnCallRuleDto;
}
export interface CreateEventAlertDto extends CreateAlertBaseDto {
  type: 'EVENT';
  rule: EventRuleDto;
}
export interface CreateAcctBalAlertDto extends CreateAlertBaseDto {
  type: 'ACCT_BAL_NUM' | 'ACCT_BAL_PCT';
  rule: AcctBalRuleDto;
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
  webhookDestinations: Joi.array().items(Joi.number()).optional(),
  rule: Joi.alternatives()
    .conditional('type', {
      switch: [
        { is: 'TX_SUCCESS', then: TxRuleSchema },
        { is: 'TX_FAILURE', then: TxRuleSchema },
        { is: 'FN_CALL', then: FnCallRuleSchema },
        { is: 'EVENT', then: EventRuleSchema },
        { is: 'ACCT_BAL_PCT', then: AcctBalRuleSchema },
        { is: 'ACCT_BAL_NUM', then: AcctBalRuleSchema },
      ],
    })
    .required(),
});

// update alert
export interface UpdateAlertDto {
  id: number;
  name?: string;
  isPaused?: boolean;
}
export const UpdateAlertSchema = Joi.object({
  id: Joi.number().required(),
  name: Joi.string(),
  isPaused: Joi.boolean(),
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

// delete webhook destinations
export interface DeleteWebhookDestinationDto {
  id: number;
}
export const DeleteWebhookDestinationSchema = Joi.object({
  id: Joi.number().required(),
});

// list webhook destinations
export interface ListWebhookDestinationDto {
  project: string;
}
export const ListWebhookDestinationSchema = Joi.object({
  project: Joi.string().required(),
});
