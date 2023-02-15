import { z } from 'zod';
import {
  OrgRole,
  ProjectTutorial,
  Net,
  UserActionType,
} from '@pc/database/clients/core';

// Explorer types
export const accountId = z.string();
export type AccountId = z.infer<typeof accountId>;
export const receiptId = z.string();
export type ReceiptId = z.infer<typeof receiptId>;
export const transactionHash = z.string();
export type TransactionHash = z.infer<typeof transactionHash>;
export const blockHash = z.string();
export type BlockHash = z.infer<typeof blockHash>;
export const yoctoNear = z.string();
export type YoctoNear = z.infer<typeof yoctoNear>;
export const transactionStatus = z.enum(['unknown', 'failure', 'success']);
export type TransactionStatus = z.infer<typeof transactionStatus>;

export const userUid = z.string();
export type UserUid = z.infer<typeof userUid>;
export const projectSlug = z.string();
export type ProjectSlug = z.infer<typeof projectSlug>;
export const orgSlug = z.string();
export type OrgSlug = z.infer<typeof orgSlug>;
export const contractSlug = z.string();
export type ContractSlug = z.infer<typeof contractSlug>;
export const apiKeySlug = z.string();
export type ApiKeySlug = z.infer<typeof apiKeySlug>;
// TESTNET = 1, MAINNET = 2
export const environmentId = z.number();
export type EnvironmentId = z.infer<typeof environmentId>;

// We're defining types explicitly here to double-check schema type and DB type match.
export const net: z.ZodType<Net> = z.enum(['MAINNET', 'TESTNET']);
export { Net };

export const userActionType: z.ZodType<UserActionType> =
  z.literal('ROTATE_API_KEY');
export { UserActionType };

export const user = z.strictObject({
  id: z.number(),
  uid: userUid,
  email: z.string().email(),
  active: z.boolean(),
  createdAt: z.date().or(z.null()),
  updatedAt: z.date().or(z.null()),
});

export const projectTutorial: z.ZodType<ProjectTutorial> = z.enum([
  'NFT_MARKET',
  'CROSSWORD',
]);
export { ProjectTutorial };
export const projectName = z.string().max(50);
export const project = z.strictObject({
  id: z.number(),
  name: projectName,
  slug: projectSlug,
  active: z.boolean(),
  tutorial: projectTutorial.or(z.null()),
  createdAt: z.date().or(z.null()),
  createdBy: z.number().or(z.null()),
  updatedAt: z.date().or(z.null()),
  updatedBy: z.number().or(z.null()),
  orgSlug,
});

export const orgRole: z.ZodType<OrgRole> = z.enum(['ADMIN', 'COLLABORATOR']);
export { OrgRole };
export const orgName = z.string();
export const org = z.strictObject({
  slug: orgSlug,
  name: orgName,
  personalForUserId: z.number().or(z.null()),
  active: z.boolean(),
  emsId: z.string(),
  createdAt: z.date().or(z.null()),
  createdBy: z.number().or(z.null()),
  updatedAt: z.date().or(z.null()),
  updatedBy: z.number().or(z.null()),
});

export const orgMember = z.strictObject({
  orgSlug,
  userId: z.number(),
  role: orgRole,
  createdAt: z.date().or(z.null()),
  createdBy: z.number().or(z.null()),
  updatedAt: z.date().or(z.null()),
  updatedBy: z.number().or(z.null()),
});

export const orgInvite = z.strictObject({
  id: z.number(),
  orgSlug,
  email: z.string().email(),
  role: orgRole,
  token: z.string(),
  tokenExpiresAt: z.date(),
  createdAt: z.date().or(z.null()),
  createdBy: z.number().or(z.null()),
  updatedAt: z.date().or(z.null()),
  updatedBy: z.number().or(z.null()),
});

export const contract = z.strictObject({
  id: z.number(),
  slug: contractSlug,
  environmentId: environmentId,
  address: accountId,
  net,
  active: z.boolean(),
  createdAt: z.date().or(z.null()),
  createdBy: z.number().or(z.null()),
  updatedAt: z.date().or(z.null()),
  updatedBy: z.number().or(z.null()),
});

export const environment = z.strictObject({
  id: z.number(),
  name: z.string(),
  projectId: z.number(),
  net,
  subId: environmentId,
  active: z.boolean(),
  createdAt: z.date().or(z.null()),
  createdBy: z.number().or(z.null()),
  updatedAt: z.date().or(z.null()),
  updatedBy: z.number().or(z.null()),
});

export const apiKey = z.strictObject({
  id: z.number(),
  slug: apiKeySlug,
  projectSlug,
  orgSlug,
  description: z.string(),
  active: z.boolean(),
  createdAt: z.date().or(z.null()),
  createdBy: z.number().or(z.null()),
  updatedAt: z.date().or(z.null()),
  updatedBy: z.number().or(z.null()),
});
