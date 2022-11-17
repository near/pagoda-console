import type { AbiRoot } from 'near-abi-client-js';
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
const abiRoot: z.ZodType<AbiRoot> = z.strictObject({
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

export const query = {
  inputs: {
    getContractAbi: z.strictObject({
      contract: contractSlug,
    }),
  },

  outputs: {
    getContractAbi: abi
      .pick({ contractSlug: true })
      .merge(z.strictObject({ abi: abiRoot })),
  },

  errors: {
    getContractAbi: z.unknown(),
  },
};

export const mutation = {
  inputs: {
    addContractAbi: z.strictObject({
      contract: contractSlug,
      abi: abiRoot,
    }),
  },

  outputs: {
    addContractAbi: abi
      .pick({ contractSlug: true })
      .merge(z.strictObject({ abi: abiRoot })),
  },

  errors: {
    addContractAbi: z.unknown(),
  },
};
