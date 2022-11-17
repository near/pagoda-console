import { z } from 'zod';
import { stringifiedDate } from '../schemas';
import {
  blockHash,
  environmentId,
  projectSlug,
  receiptId,
  transactionHash,
} from '../core/types';
import { ruleType, alertId } from './alerts.schema';
import { flavored, Flavored } from '../utils';

export const triggeredAlertSlug = z
  .string()
  .refine<Flavored<'triggeredAlertSlug'>>(flavored);
export type TriggeredAlertSlug = z.infer<typeof triggeredAlertSlug>;

const triggeredAlert = z.strictObject({
  slug: triggeredAlertSlug,
  alertId: z.number(),
  name: z.string(),
  type: ruleType,
  triggeredInBlockHash: blockHash,
  triggeredInTransactionHash: transactionHash.or(z.null()),
  triggeredInReceiptId: receiptId.or(z.null()),
  triggeredAt: stringifiedDate,
  extraData: z.record(z.unknown()),
});
export type TriggeredAlert = z.infer<typeof triggeredAlert>;

const triggeredAlerts = z.strictObject({
  count: z.number(),
  page: triggeredAlert.array(),
});

export const query = {
  inputs: {
    listTriggeredAlerts: z.strictObject({
      projectSlug,
      environmentSubId: environmentId,
      skip: z.number().int().min(0).optional(),
      take: z.number().int().min(0).max(100).optional(),
      pagingDateTime: stringifiedDate.optional(),
      alertId: alertId.optional(),
    }),
    getTriggeredAlertDetails: z.strictObject({
      slug: triggeredAlertSlug,
    }),
  },

  outputs: {
    listTriggeredAlerts: triggeredAlerts,
    getTriggeredAlertDetails: triggeredAlert,
  },

  errors: {
    listTriggeredAlerts: z.unknown(),
    getTriggeredAlertDetails: z.unknown(),
  },
};
