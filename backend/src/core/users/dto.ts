// Note: we use Joi instead of Nest's default recommendation of class-validator
// because class-validator was experiencing issues at the time of implementation
// and had many unaddressed github issues

import { Api } from '@pc/common/types/api';
import * as Joi from 'joi';

const OrgRoleSchema = Joi.alternatives('ADMIN', 'COLLABORATOR');

// create org
export const CreateOrgSchema = Joi.object<
  Api.Mutation.Input<'/users/createOrg'>,
  true
>({
  name: Joi.string(),
});

// invite to org
export const InviteToOrgSchema = Joi.object<
  Api.Mutation.Input<'/users/inviteToOrg'>,
  true
>({
  org: Joi.string(),
  email: Joi.string().email(),
  role: OrgRoleSchema,
});

// accept org invite
export const AcceptOrgInviteSchema = Joi.object<
  Api.Mutation.Input<'/users/acceptOrgInvite'>,
  true
>({
  token: Joi.string(),
});

// remove org invite
export const RemoveOrgInviteSchema = Joi.object<
  Api.Mutation.Input<'/users/removeOrgInvite'>,
  true
>({
  org: Joi.string(),
  email: Joi.string().email(),
});

// remove from org
export const RemoveFromOrgSchema = Joi.object<
  Api.Mutation.Input<'/users/removeFromOrg'>,
  true
>({
  org: Joi.string(),
  user: Joi.string(),
});

// list org members
export const ListOrgMembersSchema = Joi.object<
  Api.Query.Input<'/users/listOrgMembers'>,
  true
>({
  org: Joi.string(),
});

// delete org
export const DeleteOrgSchema = Joi.object<
  Api.Mutation.Input<'/users/deleteOrg'>,
  true
>({
  org: Joi.string(),
});

// change org role
export const ChangeOrgRoleSchema = Joi.object<
  Api.Mutation.Input<'/users/changeOrgRole'>,
  true
>({
  org: Joi.string(),
  role: OrgRoleSchema,
  user: Joi.string(),
});

// reset password
export const ResetPasswordSchema = Joi.object<
  Api.Mutation.Input<'/users/resetPassword'>,
  true
>({
  email: Joi.string().required(),
});
