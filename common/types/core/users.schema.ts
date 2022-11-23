import { z } from 'zod';
import {
  orgRole,
  orgName,
  orgSlug,
  userUid,
  org,
  orgInvite,
  user,
  orgMember,
} from './types';

export const query = {
  inputs: {
    getAccountDetails: z.void(),
    listOrgsWithOnlyAdmin: z.void(),
    listOrgMembers: z.strictObject({ org: orgSlug }),
    listOrgs: z.void(),
  },

  outputs: {
    getAccountDetails: z.strictObject({
      uid: z.string().optional(),
      email: z.string().optional(),
      name: z.string().optional(),
      photoUrl: z.string().optional(),
    }),
    listOrgsWithOnlyAdmin: org.pick({ name: true, slug: true }).array(),
    listOrgMembers: z.array(
      orgInvite.pick({ orgSlug: true, role: true }).and(
        z.union([
          z.strictObject({
            isInvite: z.literal(true),
            user: z.strictObject({
              uid: z.null(),
              email: orgInvite.shape.email,
            }),
          }),
          z.strictObject({
            isInvite: z.literal(false),
            user: user.pick({ email: true, uid: true }),
          }),
        ]),
      ),
    ),
    listOrgs: z.array(
      org.pick({ slug: true, name: true }).merge(
        z.strictObject({
          isPersonal: z.boolean(),
        }),
      ),
    ),
  },

  errors: {
    getAccountDetails: z.unknown(),
    listOrgsWithOnlyAdmin: z.unknown(),
    listOrgMembers: z.unknown(),
    listOrgs: z.unknown(),
  },
};

export const mutation = {
  inputs: {
    deleteAccount: z.void(),
    createOrg: z.strictObject({
      name: orgName,
    }),
    inviteToOrg: z.strictObject({
      org: orgSlug,
      email: z.string().email(),
      role: orgRole,
    }),
    acceptOrgInvite: z.strictObject({
      token: z.string(),
    }),
    deleteOrg: z.strictObject({
      org: orgSlug,
    }),
    changeOrgRole: z.strictObject({
      org: orgSlug,
      role: orgRole,
      user: userUid,
    }),
    removeFromOrg: z.strictObject({
      org: orgSlug,
      user: userUid,
    }),
    removeOrgInvite: z.strictObject({
      org: orgSlug,
      email: z.string().email(),
    }),
    resetPassword: z.strictObject({
      email: z.string().email(),
    }),
  },

  outputs: {
    deleteAccount: z.void(),
    createOrg: org
      .pick({ name: true, slug: true })
      .merge(z.strictObject({ isPersonal: z.literal(false) })),
    inviteToOrg: z.void(),
    acceptOrgInvite: org.pick({ name: true, slug: true }),
    deleteOrg: z.void(),
    changeOrgRole: orgMember.pick({ orgSlug: true, role: true }).merge(
      z.strictObject({
        user: user.pick({ uid: true, email: true }),
      }),
    ),
    removeFromOrg: z.void(),
    removeOrgInvite: z.void(),
    resetPassword: z.void(),
  },

  errors: {
    deleteAccount: z.unknown(),
    createOrg: z.unknown(),
    inviteToOrg: z.unknown(),
    acceptOrgInvite: z.unknown(),
    deleteOrg: z.unknown(),
    changeOrgRole: z.unknown(),
    removeFromOrg: z.unknown(),
    removeOrgInvite: z.unknown(),
    resetPassword: z.unknown(),
  },
};
