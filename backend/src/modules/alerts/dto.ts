// Note: we use Joi instead of Nest's default recommendation of class-validator
// because class-validator was experiencing issues at the time of implementation
// and had many unaddressed github issues
import { DestinationType } from '../../../generated/prisma/alerts';
import * as Joi from 'joi';
import {
  AcctBalRuleDto,
  EventRuleDto,
  FnCallRuleDto,
  RuleType,
  TxRuleDto,
} from './serde/dto.types';
import { BN } from 'bn.js';

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
const AcctBalPctRuleSchema = Joi.object({
  contract: Joi.string().required(),
  from: Joi.string()
    .empty(null)
    .optional()
    .regex(/^0$|^[1-9][0-9]?$|^100$/), // Percentage between 0 and 100
  to: Joi.string()
    .empty(null)
    .optional()
    .regex(/^0$|^[1-9][0-9]?$|^100$/), // Percentage between 0 and 100
});

const validateYoctonearAmount = (value, _) => {
  const bnValue = new BN(value);
  const upperBound = new BN('340282366920938463463374607431768211456'); // 2^128
  if (bnValue.ltn(0) || bnValue.gte(upperBound)) {
    throw Error(
      'Values "to" and "from" should be integers within the range of [0, 2^128)',
    );
  }
};

const AcctBalNumRuleSchema = Joi.object({
  contract: Joi.string().required(),
  from: Joi.string()
    .empty(null)
    .optional()
    .regex(/^0$|^[1-9][0-9]*$/)
    .custom(
      validateYoctonearAmount,
      'Validating proper value of Yoctonear amount',
    ),
  to: Joi.string()
    .empty(null)
    .optional()
    .regex(/^0$|^[1-9][0-9]*$/)
    .custom(
      validateYoctonearAmount,
      'Validating proper value of Yoctonear amount',
    ),
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
        {
          is: 'ACCT_BAL_PCT',
          then: AcctBalPctRuleSchema,
        },
        {
          is: 'ACCT_BAL_NUM',
          then: AcctBalNumRuleSchema,
        },
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

// verify email
export interface VerifyEmailDto {
  token: string;
}
export const VerifyEmailSchema = Joi.object({
  token: Joi.string().required(),
});

// Triggered Alerts
export interface ListTriggeredAlertDto {
  projectSlug: string;
  environmentSubId: number;
  skip?: number;
  take?: number;
  pagingDateTime?: Date;
  alertId?: number;
}
export const ListTriggeredAlertSchema = Joi.object({
  projectSlug: Joi.string().required(),
  environmentSubId: Joi.number().required(),
  skip: Joi.number().integer().min(0).optional(),
  take: Joi.number().integer().min(0).max(100).optional(),
  pagingDateTime: Joi.date().optional(),
  alertId: Joi.number().integer().positive().optional(),
});

export interface GetTriggeredAlertDetailsDto {
  slug: string;
}
export const GetTriggeredAlertDetailsSchema = Joi.object({
  slug: Joi.string().required(),
});

export interface TriggeredAlertsResponseDto {
  count: number;
  page: Array<TriggeredAlertDetailsResponseDto>;
}
export interface TriggeredAlertDetailsResponseDto {
  slug: string;
  alertId: number;
  name: string;
  type: RuleType;
  triggeredInBlockHash: string;
  triggeredInTransactionHash: string;
  triggeredInReceiptId: string;
  triggeredAt: Date;
  extraData?: Record<string, unknown>;
}

// resend verification email
export interface ResendEmailVerificationDto {
  destinationId: number;
}
export const ResendEmailVerificationSchema = Joi.object({
  destinationId: Joi.number().required(),
});

// unsubscribe from alerts email
export interface UnsubscribeFromEmailAlertDto {
  token: string;
}
export const UnsubscribeFromEmailAlertSchema = Joi.object({
  token: Joi.string().required(),
});
