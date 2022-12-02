import { z } from 'zod';
import { contractSlug } from '../core/types';
import { json } from '../schemas';

export const abi = z.strictObject({
  id: z.number(),
  contractSlug,
  abi: json,
  createdAt: z.date().or(z.null()),
  createdBy: z.number().or(z.null()),
});

const jsonSchemaV7 = z.object({}).passthrough();
const abiType = z.strictObject({
  type_schema: jsonSchemaV7,
  serialization_type: z.string(),
});
export const abiRoot = z.strictObject({
  schema_version: z.string(),
  metadata: z
    .object({
      name: z.string(),
      version: z.string(),
      authors: z.array(z.string()),
    })
    .passthrough()
    .optional(),
  body: z.strictObject({
    functions: z.array(
      z.strictObject({
        name: z.string(),
        doc: z.string().optional(),
        is_view: z.boolean().optional(),
        is_init: z.boolean().optional(),
        is_payable: z.boolean().optional(),
        is_private: z.boolean().optional(),
        params: z.array(abiType.extend({ name: z.string() })).optional(),
        callbacks: z.any().optional(),
        callbacks_vec: abiType.optional(),
        result: abiType.optional(),
      }),
    ),
    root_schema: jsonSchemaV7,
  }),
});
