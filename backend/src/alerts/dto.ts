// Note: we use Joi instead of Nest's default recommendation of class-validator
// because class-validator was experiencing issues at the time of implementation
// and had many unaddressed github issues

import { AlertRuleType, NumberComparator, TxAction } from '.prisma/client';
import * as Joi from 'joi';

export interface CreateFnCallRule {
  function: string;
  // params: object;
}
export const CreateFnCallRuleSchema = Joi.object({
  function: Joi.string().required(),
  // params: Joi.object(),
});

export interface CreateTxRule {
  action?: TxAction;
}
export const CreateTxRuleSchema = Joi.object({
  action: Joi.string(),
});

export interface CreateEventRule {
  standard: string;
  version: string;
  event: string;
  // data: object;
}
export const CreateEventRuleSchema = Joi.object({
  standard: Joi.string().required(),
  version: Joi.string().required(),
  event: Joi.string().required(),
  // data: Joi.object(),
});

export interface CreateAcctBalRule {
  comparator: NumberComparator;
  amount: number;
}
export const CreateAcctBalRuleSchema = Joi.object({
  comparator: Joi.string()
    .allow('EQ', 'NEQ', 'LT', 'LTE', 'GT', 'GTE')
    .required(),
  amount: Joi.number().required(),
});

// create alert rule
export interface CreateAlertRuleDto {
  name?: string;
  type: AlertRuleType;
  rule: CreateFnCallRule | CreateTxRule | CreateEventRule | CreateAcctBalRule;
  contract: number;
  environment: number;
}
export const CreateAlertRuleSchema = Joi.object({
  name: Joi.string(),
  type: Joi.string().required(),
  // The field `rule` is required but you can leave it empty if the schema permits it. E.g. `rule: {}`
  rule: Joi.alternatives()
    .conditional('type', {
      switch: [
        { is: 'TX_SUCCESS', then: CreateTxRuleSchema },
        { is: 'TX_FAILURE', then: CreateTxRuleSchema },
        { is: 'FN_CALL', then: CreateFnCallRuleSchema },
        { is: 'EVENT', then: CreateEventRuleSchema },
        { is: 'ACCT_BAL_PCT', then: CreateAcctBalRuleSchema },
        { is: 'ACCT_BAL_NUM', then: CreateAcctBalRuleSchema },
      ],
    })
    .required(),
  contract: Joi.number().required(),
  environment: Joi.number().required(),
});

// // delete alert
// export interface DeleteAlertDto {
//   slug: string;
// }
// export const DeleteAlertSchema = Joi.object({
//   slug: Joi.string().required(),
// });

// // is alert name unique
// export interface IsAlertNameUniqueDto {
//   name: string;
// }
// export const IsAlertNameUniqueSchema = Joi.object({
//   name: alertNameSchema,
// });

// // get alert details
// export interface GetAlertDetailsDto {
//   slug: string;
// }
// export const GetAlertDetailsSchema = Joi.object({
//   slug: Joi.string().required(),
// });
