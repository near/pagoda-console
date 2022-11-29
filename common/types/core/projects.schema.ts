import { z } from 'zod';

import {
  orgSlug,
  projectSlug,
  environmentId,
  contractSlug,
  apiKeySlug,
  accountId,
  projectTutorial,
  projectName,
  project,
  org,
  contract,
  environment,
  apiKey,
  keyType,
} from './types';

export const query = {
  inputs: {
    getDetails: z.strictObject({
      slug: projectSlug,
    }),
    getContracts: z.strictObject({
      project: projectSlug,
      environment: environmentId,
    }),
    getContract: z.strictObject({
      slug: contractSlug,
    }),
    list: z.void(),
    getEnvironments: z.strictObject({
      project: projectSlug,
    }),
    getKeys: z.strictObject({
      project: projectSlug,
    }),
  },

  outputs: {
    getDetails: project.pick({ name: true, slug: true, tutorial: true }).merge(
      z.strictObject({
        org: org.pick({ name: true, slug: true, personalForUserId: true }),
      }),
    ),
    getContracts: contract
      .pick({ slug: true, address: true, net: true })
      .array(),
    getContract: contract.pick({ slug: true, address: true, net: true }),
    list: z.array(
      project
        .pick({
          name: true,
          slug: true,
          tutorial: true,
          active: true,
        })
        .merge(
          z.strictObject({
            org: org.pick({ slug: true, name: true }).merge(
              z.strictObject({
                isPersonal: z.boolean(),
              }),
            ),
          }),
        ),
    ),
    getEnvironments: z.array(
      environment.pick({ subId: true, net: true, name: true }),
    ),
    getKeys: z.array(
      apiKey.pick({ description: true }).merge(
        z.strictObject({
          keySlug: apiKey.shape.slug,
          key: z.string(),
          type: keyType,
        }),
      ),
    ),
  },

  errors: {
    getDetails: z.unknown(),
    getContracts: z.unknown(),
    getContract: z.unknown(),
    list: z.unknown(),
    getEnvironments: z.unknown(),
    getKeys: z.unknown(),
  },
};

export const mutation = {
  inputs: {
    create: z.strictObject({
      name: projectName,
      org: orgSlug.optional(),
      tutorial: projectTutorial.optional(),
    }),
    ejectTutorial: z.strictObject({
      slug: projectSlug,
    }),
    delete: z.strictObject({
      slug: projectSlug,
    }),
    addContract: z.strictObject({
      project: projectSlug,
      environment: environmentId,
      address: accountId,
    }),
    removeContract: z.strictObject({
      slug: contractSlug,
    }),
    rotateKey: z.strictObject({
      slug: apiKeySlug,
    }),
    generateKey: z.discriminatedUnion('type', [
      z.strictObject({
        type: z.literal('KEY'),
        project: projectSlug,
        description: z.string(),
      }),
      z.strictObject({
        type: z.literal('JWT'),
        project: projectSlug,
        description: z.string(),
        publicKey: z.string(),
        issuer: z.string(),
      }),
    ]),
    deleteKey: z.strictObject({
      slug: apiKeySlug,
    }),
  },

  outputs: {
    create: project.pick({ name: true, slug: true }),
    ejectTutorial: z.void(),
    delete: z.void(),
    addContract: contract.pick({
      id: true,
      slug: true,
      address: true,
      net: true,
    }),
    removeContract: z.void(),
    rotateKey: apiKey.pick({ description: true }).merge(
      z.strictObject({
        keySlug: apiKey.shape.slug,
        key: z.string(),
      }),
    ),
    generateKey: apiKey.pick({ description: true }).merge(
      z.strictObject({
        keySlug: apiKey.shape.slug,
        key: z.string(),
        type: keyType,
      }),
    ),
    deleteKey: z.void(),
  },

  errors: {
    create: z.unknown(),
    ejectTutorial: z.unknown(),
    delete: z.unknown(),
    addContract: z.unknown(),
    removeContract: z.unknown(),
    rotateKey: z.unknown(),
    generateKey: z.unknown(),
    deleteKey: z.unknown(),
  },
};
