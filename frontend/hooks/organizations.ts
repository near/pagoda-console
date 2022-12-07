import type { Api } from '@pc/common/types/api';
import { useMemo } from 'react';
import type { MutatorCallback, MutatorOptions } from 'swr';
import useSWR, { mutate } from 'swr';

import { openToast } from '@/components/lib/Toast';
import { useAuth } from '@/hooks/auth';
import { fetchApi } from '@/utils/http';

export enum UserError {
  SERVER_ERROR = 'SERVER_ERROR',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  BAD_ORG = 'BAD_ORG',
  MISSING_ORG_NAME = 'MISSING_ORG_NAME',
  ORG_INVITE_BAD_TOKEN = 'ORG_INVITE_BAD_TOKEN',
  ORG_INVITE_DUPLICATE = 'ORG_INVITE_DUPLICATE',
  ORG_INVITE_EMAIL_MISMATCH = 'ORG_INVITE_EMAIL_MISMATCH',
  ORG_INVITE_EXPIRED = 'ORG_INVITE_EXPIRED',
  ORG_INVITE_ALREADY_MEMBER = 'ORG_INVITE_ALREADY_MEMBER',
  BAD_ORG_PERSONAL = 'BAD_ORG_PERSONAL',
  ORG_FINAL_ADMIN = 'ORG_FINAL_ADMIN',
  BAD_USER = 'BAD_USER',
  NAME_CONFLICT = 'NAME_CONFLICT',
  BAD_ORG_INVITE = 'BAD_ORG_INVITE',
}

const isUserError = (code: string): code is UserError => {
  switch (code) {
    case 'SERVER_ERROR':
    case 'PERMISSION_DENIED':
    case 'BAD_ORG':
    case 'MISSING_ORG_NAME':
    case 'ORG_INVITE_BAD_TOKEN':
    case 'ORG_INVITE_DUPLICATE':
    case 'ORG_INVITE_EMAIL_MISMATCH':
    case 'ORG_INVITE_EXPIRED':
    case 'ORG_INVITE_ALREADY_MEMBER':
    case 'BAD_ORG_PERSONAL':
    case 'ORG_FINAL_ADMIN':
    case 'BAD_USER':
    case 'NAME_CONFLICT':
    case 'BAD_ORG_INVITE':
      return true;
    default:
      return false;
  }
};

const DEFAULT_ERROR_MESSAGE = 'Unknown server error';

export type ParsedError = {
  code: UserError;
  message: string;
};

export const parseError = (e: any, messageParser: (code: UserError) => string | undefined) => {
  const userError = isUserError(e.message) ? e.message : UserError.SERVER_ERROR;
  throw { code: userError, message: messageParser(userError) || DEFAULT_ERROR_MESSAGE };
};

export const openSuccessToast = (message: string) =>
  openToast({ type: 'success', title: 'Success', description: message });

export const openUserErrorToast = (error: unknown) => {
  const castedError = error as ParsedError;
  return openToast({ type: 'error', title: getErrorTitle(castedError.code), description: castedError.message });
};

const getErrorTitle = (error: UserError) => {
  switch (error) {
    case UserError.SERVER_ERROR:
      return 'Server Error';
    case UserError.PERMISSION_DENIED:
      return 'Permission denied';
    case UserError.BAD_ORG:
      return 'Bad organization';
    case UserError.MISSING_ORG_NAME:
      return 'Missing organization name';
    case UserError.ORG_INVITE_BAD_TOKEN:
      return 'Bad invite token';
    case UserError.ORG_INVITE_DUPLICATE:
      return 'Duplicate invite';
    case UserError.ORG_INVITE_EMAIL_MISMATCH:
      return 'Invite email mismatch';
    case UserError.ORG_INVITE_EXPIRED:
      return 'Invite expired';
    case UserError.ORG_INVITE_ALREADY_MEMBER:
      return 'User already a member';
    case UserError.BAD_ORG_PERSONAL:
      return 'Personal organization';
    case UserError.ORG_FINAL_ADMIN:
      return 'Only admin';
    case UserError.BAD_USER:
      return 'Bad user';
    case UserError.NAME_CONFLICT:
      return 'Name conflict';
    case UserError.BAD_ORG_INVITE:
      return 'Bad invite';
    default:
      return 'Unknown error';
  }
};

const getOrgMembersKey = (orgSlug: string | undefined) => ['/users/listOrgMembers', orgSlug] as const;
const getOrgsKey = () => ['/users/listOrgs'] as const;

export const useOrgMembers = (slug: string) => {
  const { identity } = useAuth();
  const { data, error, mutate, isValidating } = useSWR(identity ? getOrgMembersKey(slug) : null, (path) =>
    fetchApi([path, { org: slug }]),
  );

  return { members: data, error, mutate, isValidating };
};

export const useOrganizations = (filterPersonal: boolean) => {
  const { identity } = useAuth();
  const { data, error, mutate, isValidating } = useSWR(identity ? getOrgsKey() : null, (path) => fetchApi([path]));
  const filteredOrgs = useMemo(
    () => (filterPersonal ? data?.filter((org) => !org.isPersonal) : data),
    [data, filterPersonal],
  );

  return { organizations: filteredOrgs, error, mutate, isValidating };
};

type MutationData<T> = T | Promise<T> | MutatorCallback<T>;

type Orgs = Api.Query.Output<'/users/listOrgs'>;

export const mutateOrganizations = (data?: MutationData<Orgs>, opts?: boolean | MutatorOptions<Orgs>) =>
  mutate<Orgs>(getOrgsKey(), data, opts);

type OrgMembers = Api.Query.Output<'/users/listOrgMembers'>;

export const mutateOrganizationMembers = (
  orgSlug: string,
  data?: MutationData<OrgMembers>,
  opts?: boolean | MutatorOptions<OrgMembers>,
) => mutate<OrgMembers>(getOrgMembersKey(orgSlug), data, opts);

export const useOrgsWithOnlyAdmin = () => {
  const { identity } = useAuth();
  const { data, error, mutate, isValidating } = useSWR(
    identity ? ['/users/listOrgsWithOnlyAdmin' as const, identity.uid] : null,
    (key) => fetchApi([key]),
  );

  return { organizations: data, error, mutate, isValidating };
};

export const useSelectedOrg = (orgSlug: string, filterPersonal: boolean) => {
  const { organizations } = useOrganizations(filterPersonal);
  return organizations?.find((organization) => organization.slug === orgSlug);
};
