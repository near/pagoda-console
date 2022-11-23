import { z } from 'zod';
import { DateTime } from 'luxon';

export const stringifiedDate = z
  .string()
  .refine((input) => DateTime.fromISO(input).isValid, 'Date is invalid');

const literal = z.union([z.string(), z.number(), z.boolean(), z.null()]);
type Literal = z.infer<typeof literal>;
type Json = Literal | { [key: string]: Json } | Json[];
export const json: z.ZodType<Json> = z.lazy(() =>
  z.union([literal, z.array(json), z.record(json)]),
);
