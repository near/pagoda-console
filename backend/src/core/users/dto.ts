// Note: we use Joi instead of Nest's default recommendation of class-validator
// because class-validator was experiencing issues at the time of implementation
// and had many unaddressed github issues

import { OrgRole, OrgMember, User, Org } from '../../../generated/prisma/core';
import * as Joi from 'joi';

// Composable Response DTOs

export type OrgMemberData = Pick<OrgMember, 'orgSlug' | 'role'> & {
  user: Pick<User, 'uid' | 'email'>;
};

export type OrgData = Pick<Org, 'slug' | 'name'> & { isPersonal: boolean };

// Request DTOs

const OrgRoleSchema = Joi.string().valid('ADMIN', 'COLLABORATOR');

// create org
export interface CreateOrgDto {
  name: string;
}
export const CreateOrgSchema = Joi.object({
  name: Joi.string(),
});

// invite to org
export interface InviteToOrgDto {
  org: Org['slug'];
  email: string;
  role: OrgRole;
}
export const InviteToOrgSchema = Joi.object({
  org: Joi.string(),
  email: Joi.string().email(),
  role: OrgRoleSchema,
});

// accept org invite
export interface AcceptOrgInviteDto {
  token: string;
}
export const AcceptOrgInviteSchema = Joi.object({
  token: Joi.string(),
});

// remove org invite
export interface RemoveOrgInviteDto {
  org: Org['slug'];
  email: string;
}
export const RemoveOrgInviteSchema = Joi.object({
  org: Joi.string(),
  email: Joi.string().email(),
});

// remove from org
export interface RemoveFromOrgDto {
  org: Org['slug'];
  user: User['uid'];
}
export const RemoveFromOrgSchema = Joi.object({
  org: Joi.string(),
  user: Joi.string(),
});

// list org members
export interface ListOrgMembersDto {
  org: Org['slug'];
}
export const ListOrgMembersSchema = Joi.object({
  org: Joi.string(),
});

// delete org
export interface DeleteOrgDto {
  org: Org['slug'];
}
export const DeleteOrgSchema = Joi.object({
  org: Joi.string(),
});

// change org role
export interface ChangeOrgRoleDto {
  org: Org['slug'];
  role: OrgRole;
  user: User['uid'];
}
export const ChangeOrgRoleSchema = Joi.object({
  org: Joi.string(),
  role: OrgRoleSchema,
  user: Joi.string(),
});

// reset password
export interface ResetPasswordDto {
  email: string;
}
export const ResetPasswordSchema = Joi.object({
  email: Joi.string().required(),
});
