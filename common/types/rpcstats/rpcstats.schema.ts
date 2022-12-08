import { z } from 'zod';
import { environmentId, net, projectSlug } from '../core/types';
import { stringifiedDate } from '../schemas';

export const dateTimeResolution = z.enum([
  'FIFTEEN_SECONDS',
  'ONE_MINUTE',
  'ONE_HOUR',
  'ONE_DAY',
]);
export type DateTimeResolution = z.infer<typeof dateTimeResolution>;

export const timeRangeValue = z.enum([
  '15_MINS',
  '1_HRS',
  '24_HRS',
  '7_DAYS',
  '30_DAYS',
]);
export type TimeRangeValue = z.infer<typeof timeRangeValue>;

const metrics = z.strictObject({
  apiKeyIdentifier: z.string(),
  endpointGroup: z.string().optional(),
  endpointMethod: z.string(),
  network: net,
  windowStart: stringifiedDate.optional(),
  windowEnd: stringifiedDate.optional(),
  successCount: z.number(),
  errorCount: z.number(),
  minLatency: z.number(),
  maxLatency: z.number(),
  meanLatency: z.number(),
});
export type Metrics = z.infer<typeof metrics>;

export const query = {
  inputs: {
    endpointMetrics: z.strictObject({
      projectSlug,
      environmentSubId: environmentId,
      startDateTime: stringifiedDate,
      endDateTime: stringifiedDate,
      skip: z.number().int().min(0).optional(),
      take: z.number().int().min(0).max(100).optional(),
      pagingDateTime: stringifiedDate.optional(),
      filter: z.discriminatedUnion('type', [
        z.strictObject({
          type: z.literal('date'),
          dateTimeResolution,
        }),
        z.strictObject({
          type: z.literal('endpoint'),
        }),
      ]),
    }),
  },

  outputs: {
    endpointMetrics: z.strictObject({
      count: z.number(),
      page: metrics.array(),
    }),
  },

  errors: {
    endpointMetrics: z.unknown(),
  },
};
