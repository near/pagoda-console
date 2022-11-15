// Note: we use Joi instead of Nest's default recommendation of class-validator
// because class-validator was experiencing issues at the time of implementation
// and had many unaddressed github issues
import * as Joi from 'joi';
import { Api } from '@pc/common/types/api';
import { Alerts } from '@pc/common/types/alerts';

const TxRuleSchema = Joi.object<Alerts.TransactionRule, true>({
  type: Joi.alternatives('TX_SUCCESS', 'TX_FAILURE'),
  contract: Joi.string().required(),
});
const FnCallRuleSchema = Joi.object<Alerts.FunctionCallRule, true>({
  type: Joi.string().valid('FN_CALL'),
  contract: Joi.string().required(),
  function: Joi.string().required(),
  // params: Joi.object(),
});
const EventRuleSchema = Joi.object<Alerts.EventRule, true>({
  type: Joi.string().valid('EVENT'),
  contract: Joi.string().required(),
  standard: Joi.string().required(),
  version: Joi.string().required(),
  event: Joi.string().required(),
  // data: Joi.object(),
});

const validateRange = (value, { original: rule }) => {
  if (!rule.from && !rule.to) {
    throw Error('"rule.from" or "rule.to" is required');
  }
  if (rule.from && rule.to && BigInt(rule.from) > BigInt(rule.to)) {
    throw Error('"rule.from" must be less than or equal to "rule.to"');
  }
  return value;
};

const AcctBalPctRuleSchema = Joi.object<Alerts.AcctBalPctRule, true>({
  type: Joi.string().valid('ACCT_BAL_PCT'),
  contract: Joi.string().required(),
  from: Joi.string()
    .empty(null)
    .optional()
    .regex(/^0$|^[1-9][0-9]?$|^100$/), // Percentage between 0 and 100
  to: Joi.string()
    .empty(null)
    .optional()
    .regex(/^0$|^[1-9][0-9]?$|^100$/), // Percentage between 0 and 100
}).custom(validateRange, 'Validating range');

const validateYoctonearAmount = (value, _) => {
  const bnValue = BigInt(value);
  const upperBound = BigInt('340282366920938463463374607431768211456'); // 2^128
  if (bnValue < 0 || bnValue >= upperBound) {
    throw Error(
      'Values "to" and "from" should be integers within the range of [0, 2^128)',
    );
  }
  return value;
};

const AcctBalNumRuleSchema = Joi.object<Alerts.AcctBalNumRule, true>({
  type: Joi.string().valid('ACCT_BAL_NUM'),
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
}).custom(validateRange, 'Validating range');

// create alert
export const CreateAlertSchema = Joi.object<
  Api.Mutation.Input<'/alerts/createAlert'>,
  true
>({
  name: Joi.string(),
  projectSlug: Joi.string().required(),
  environmentSubId: Joi.number().required(),
  destinations: Joi.array().items(Joi.number()).optional(),
  rule: Joi.alternatives()
    .conditional('rule.type', {
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
    // TODO: fix any
    .required() as any,
});

// update alert
export const UpdateAlertSchema = Joi.object<
  Api.Mutation.Input<'/alerts/updateAlert'>,
  true
>({
  id: Joi.number().required(),
  name: Joi.string(),
  // see https://github.com/hapijs/joi/issues/2848
  isPaused: Joi.boolean().optional() as unknown as Joi.AlternativesSchema,
});

// list alerts
export const ListAlertSchema = Joi.object<
  Api.Query.Input<'/alerts/listAlerts'>,
  true
>({
  projectSlug: Joi.string().required(),
  environmentSubId: Joi.number().required(),
});

// delete alert
export const DeleteAlertSchema = Joi.object<
  Api.Mutation.Input<'/alerts/deleteAlert'>,
  true
>({
  id: Joi.number().required(),
});

// get alert details
export const GetAlertDetailsSchema = Joi.object<
  Api.Query.Input<'/alerts/getAlertDetails'>,
  true
>({
  id: Joi.number().required(),
});

const WebhookDestinationSchema = Joi.object<
  Alerts.CreateWebhookDestinationConfig,
  true
>({
  type: Joi.string().valid('WEBHOOK').required(),
  url: Joi.string().required(),
});
const EmailDestinationSchema = Joi.object<
  Alerts.CreateEmailDestinationConfig,
  true
>({
  type: Joi.string().valid('EMAIL').required(),
  email: Joi.string().required(),
});
const TelegramDestinationSchema = Joi.object<
  Alerts.CreateTelegramDestinationConfig,
  true
>({
  type: Joi.string().valid('TELEGRAM').required(),
});
export const CreateDestinationSchema = Joi.object<
  Api.Mutation.Input<'/alerts/createDestination'>,
  true
>({
  name: Joi.string(),
  projectSlug: Joi.string().required(),
  config: Joi.alternatives([
    WebhookDestinationSchema,
    EmailDestinationSchema,
    TelegramDestinationSchema,
  ])
    // TODO: fix any
    .required() as any,
});

// delete destinations
export const DeleteDestinationSchema = Joi.object<
  Api.Mutation.Input<'/alerts/deleteDestination'>,
  true
>({
  id: Joi.number().required(),
});

// list destinations
export const ListDestinationSchema = Joi.object<
  Api.Query.Input<'/alerts/listDestinations'>,
  true
>({
  projectSlug: Joi.string().required(),
});

// enable destination
export const EnableDestinationSchema = Joi.object<
  Api.Mutation.Input<'/alerts/enableDestination'>,
  true
>({
  alert: Joi.number().required(),
  destination: Joi.number().required(),
});

// disable destination
export const DisableDestinationSchema = EnableDestinationSchema;

// update destination
const UpdateWebhookDestinationSchema = Joi.object<
  Alerts.UpdateWebhookDestinationConfig,
  true
>({
  type: Joi.string().valid('WEBHOOK').required(),
  url: Joi.string(),
});
const UpdateEmailDestinationSchema = Joi.object<
  Alerts.UpdateEmailDestinationConfig,
  true
>({
  type: Joi.string().valid('EMAIL').required(),
});
const UpdateTelegramDestinationSchema = Joi.object<
  Alerts.UpdateTelegramDestinationConfig,
  true
>({
  type: Joi.string().valid('TELEGRAM').required(),
});
export const UpdateDestinationSchema = Joi.object<
  Api.Mutation.Input<'/alerts/updateDestination'>,
  true
>({
  id: Joi.number().required(),
  name: Joi.string(),
  config: Joi.alternatives([
    UpdateWebhookDestinationSchema,
    UpdateEmailDestinationSchema,
    UpdateTelegramDestinationSchema,
  ]) as any,
});

// verify email
export const VerifyEmailSchema = Joi.object<
  Api.Mutation.Input<'/alerts/verifyEmailDestination'>,
  true
>({
  token: Joi.string().required(),
});

// Triggered Alerts
export const ListTriggeredAlertSchema = Joi.object<
  Api.Query.Input<'/triggeredAlerts/listTriggeredAlerts'>,
  true
>({
  projectSlug: Joi.string().required(),
  environmentSubId: Joi.number().required(),
  skip: Joi.number().integer().min(0).optional(),
  take: Joi.number().integer().min(0).max(100).optional(),
  pagingDateTime: Joi.date().optional(),
  alertId: Joi.number().integer().positive().optional(),
});

export const GetTriggeredAlertDetailsSchema = Joi.object<
  Api.Query.Input<'/triggeredAlerts/getTriggeredAlertDetails'>,
  true
>({
  slug: Joi.string().required(),
});

// resend verification email
export const ResendEmailVerificationSchema = Joi.object<
  Api.Mutation.Input<'/alerts/resendEmailVerification'>,
  true
>({
  destinationId: Joi.number().required(),
});

// unsubscribe from alerts email
export const UnsubscribeFromEmailAlertSchema = Joi.object<
  Api.Mutation.Input<'/alerts/unsubscribeFromEmailAlert'>,
  true
>({
  token: Joi.string().required(),
});

// rotate webhook destination secret
export const RotateWebhookDestinationSecretSchema = Joi.object<
  Api.Mutation.Input<'/alerts/rotateWebhookDestinationSecret'>,
  true
>({
  destinationId: Joi.number().required(),
});
