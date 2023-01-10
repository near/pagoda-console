import type { AbiRoot, AbiParameters } from 'near-abi-client-js';
import {
  AbiFunctionKind,
  AbiSerializationType,
  AbiFunctionModifier,
} from 'near-abi-client-js';
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
const serializationType = z.nativeEnum(AbiSerializationType);
const abiJsonParameter = z.strictObject({
  name: z.string(),
  type_schema: jsonSchemaV7,
});
const abiBorshParameter = z.strictObject({
  name: z.string(),
  type_schema: jsonSchemaV7,
});
const abiType = z.strictObject({
  type_schema: jsonSchemaV7,
  serialization_type: serializationType,
});
const abiParameters: z.ZodType<AbiParameters> = z.discriminatedUnion(
  'serialization_type',
  [
    z.strictObject({
      serialization_type: z.literal(AbiSerializationType.Json),
      args: z.array(abiJsonParameter),
    }),
    z.strictObject({
      serialization_type: z.literal(AbiSerializationType.Borsh),
      args: z.array(abiBorshParameter),
    }),
  ],
);
const abiFunctionKind: z.ZodType<AbiFunctionKind> =
  z.nativeEnum(AbiFunctionKind);
const abiFunctionModifier: z.ZodType<AbiFunctionModifier> =
  z.nativeEnum(AbiFunctionModifier);

const abiRoot: z.ZodType<AbiRoot> = z.strictObject({
  schema_version: z.string(),
  metadata: z
    .object({
      name: z.string().optional(),
      version: z.string().optional(),
      authors: z.array(z.string()).optional(),
      build: z
        .strictObject({
          compiler: z.string(),
          builder: z.string(),
          image: z.string().optional(),
        })
        .optional(),
      wasm_hash: z.string().optional(),
    })
    .optional(),
  body: z.strictObject({
    functions: z.array(
      z.strictObject({
        name: z.string(),
        doc: z.string().optional(),
        kind: abiFunctionKind,
        modifiers: z.array(abiFunctionModifier).optional(),
        params: abiParameters.optional(),
        callbacks: z.array(abiType).optional(),
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
      .merge(z.strictObject({ abi: abiRoot, upgraded: z.boolean() })),
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
