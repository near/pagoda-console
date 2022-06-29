// Note: we use Joi instead of Nest's default recommendation of class-validator
// because class-validator was experiencing issues at the time of implementation
// and had many unaddressed github issues
import { DestinationType } from '../../generated/prisma/alerts';
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
  destinations?: Array<number>;
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
  destinations: Joi.array().items(Joi.number()).optional(),
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

interface WebhookDestinationResponseDto {
  url: string;
}
export interface AlertDetailsResponseDto {
  id: number;
  type: RuleType;
  name: string;
  isPaused: boolean;
  projectSlug: string;
  environmentSubId: number;
  rule: TxRuleDto | FnCallRuleDto | EventRuleDto | AcctBalRuleDto;
  enabledDestinations: Array<{
    id: number;
    name: string;
    type: DestinationType;
    config: WebhookDestinationResponseDto;
  }>;
}

interface CreateBaseDestinationDto {
  name?: string;
  type: DestinationType;
  projectSlug: string;
}
interface CreateWebhookDestinationDto extends CreateBaseDestinationDto {
  type: 'WEBHOOK';
  config: {
    url: string;
  };
}
interface CreateEmailDestinationDto extends CreateBaseDestinationDto {
  type: 'EMAIL';
  config: {
    email: string;
  };
}
interface CreateTelegramDestinationDto extends CreateBaseDestinationDto {
  type: 'TELEGRAM';
  config?: Record<string, never>; // eslint recommended typing for empty object
}

export type CreateDestinationDto =
  | CreateWebhookDestinationDto
  | CreateEmailDestinationDto
  | CreateTelegramDestinationDto;

const WebhookDestinationSchema = Joi.object({
  url: Joi.string().required(),
});
const EmailDestinationSchema = Joi.object({
  email: Joi.string().required(),
});
const TelegramDestinationSchema = Joi.object({});
export const CreateDestinationSchema = Joi.object({
  name: Joi.string(),
  type: Joi.string().valid('WEBHOOK', 'EMAIL', 'TELEGRAM').required(),
  projectSlug: Joi.string().required(),
  config: Joi.alternatives()
    .conditional('type', {
      switch: [
        { is: 'WEBHOOK', then: WebhookDestinationSchema },
        { is: 'EMAIL', then: EmailDestinationSchema },
        { is: 'TELEGRAM', then: TelegramDestinationSchema },
      ],
    })
    .required(),
});

// delete destinations
export interface DeleteDestinationDto {
  id: number;
}
export const DeleteDestinationSchema = Joi.object({
  id: Joi.number().required(),
});

// list destinations
export interface ListDestinationDto {
  projectSlug: string;
}
export const ListDestinationSchema = Joi.object({
  projectSlug: Joi.string().required(),
});

// enable destination
export interface EnableDestinationDto {
  alert: number;
  destination: number;
}
export const EnableDestinationSchema = Joi.object({
  alert: Joi.number().required(),
  destination: Joi.number().required(),
});

// disable destination
export type DisableDestinationDto = EnableDestinationDto;
export const DisableDestinationSchema = EnableDestinationSchema;

// update destination
export interface UpdateDestinationBaseDto {
  id: number;
  type: DestinationType;
  name?: string;
}
export interface UpdateWebhookDestinationDto extends UpdateDestinationBaseDto {
  type: 'WEBHOOK';
  config?: {
    url?: string;
  };
}
export interface UpdateEmailDestinationDto extends UpdateDestinationBaseDto {
  type: 'EMAIL';
}
export interface UpdateTelegramDestinationDto extends UpdateDestinationBaseDto {
  type: 'TELEGRAM';
}

export type UpdateDestinationDto =
  | UpdateWebhookDestinationDto
  | UpdateEmailDestinationDto
  | UpdateTelegramDestinationDto;

const UpdateWebhookDestinationSchema = Joi.object({
  url: Joi.string(),
});
export const UpdateDestinationSchema = Joi.object({
  id: Joi.number().required(),
  type: Joi.string().required(),
  name: Joi.string(),
  config: Joi.alternatives().conditional('type', {
    switch: [{ is: 'WEBHOOK', then: UpdateWebhookDestinationSchema }],
  }),
});
