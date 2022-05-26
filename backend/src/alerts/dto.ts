// Note: we use Joi instead of Nest's default recommendation of class-validator
// because class-validator was experiencing issues at the time of implementation
// and had many unaddressed github issues

import { AlertRuleType } from '.prisma/client';
import * as Joi from 'joi';

const alertRuleNameSchema = Joi.string().required().max(50);

export interface CreateFnCallRule {
  method: string;
}
export const CreateFnCallRuleSchema = Joi.object({
  method: Joi.string().required(),
});

// export interface CreateTxRule {
//   status: TxStatus;
// }
// export const CreateTxRuleSchema = Joi.object({
//   status: Joi.string().required(),
// });

// create alert rule
export interface CreateAlertRuleDto {
  name?: string;
  type: AlertRuleType;
  rule: CreateFnCallRule; // | CreateTxRule;
  contract: number;
  environment: number;
}
export const CreateAlertRuleSchema = Joi.object({
  name: alertRuleNameSchema,
  type: Joi.string().required(),
  // rule: Joi.object({
  //   method: Joi.string(),
  //   status: Joi.string(),
  // }).or('method', 'status'),
  rule: Joi.alternatives().conditional('.type', {
    switch: [
      // { is: 'TX_SUCCESS', then: CreateTxRuleSchema },
      // { is: 'TX_FAILURE', then: CreateTxRuleSchema },
      { is: 'FN_CALL', then: CreateFnCallRuleSchema },
    ],
  }),
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
