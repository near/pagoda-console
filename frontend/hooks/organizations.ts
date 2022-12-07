import type { Api } from '@pc/common/types/api';
import { useMemo } from 'react';
import type { MutatorCallback, MutatorOptions } from 'swr';
import useSWR, { mutate } from 'swr';

import { openToast } from '@/components/lib/Toast';
import { useAccount, useAuth } from '@/hooks/auth';
import type { MutationOptions } from '@/hooks/mutation';
import { useMutation } from '@/hooks/mutation';
import { authenticatedPost } from '@/utils/http';

type User = Api.Query.Output<'/users/getAccountDetails'>;

enum UserError {
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

const parseError = (e: any, messageParser: (code: UserError) => string | undefined) => {
  const userError = isUserError(e.message) ? e.message : UserError.SERVER_ERROR;
  throw { code: userError, message: messageParser(userError) || DEFAULT_ERROR_MESSAGE };
};

const openSuccessToast = (message: string) => openToast({ type: 'success', title: 'Success', description: message });
const openUserErrorToast = (error: Api.Mutation.Error<'/users/acceptOrgInvite'>) => {
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
    authenticatedPost(path, { org: slug }),
  );

  return { members: data, error, mutate, isValidating };
};

export const useOrganizations = (filterPersonal: boolean) => {
  const { identity } = useAuth();
  const { data, error, mutate, isValidating } = useSWR(identity ? getOrgsKey() : null, (path) =>
    authenticatedPost(path),
  );
  const filteredOrgs = useMemo(
    () => (filterPersonal ? data?.filter((org) => !org.isPersonal) : data),
    [data, filterPersonal],
  );

  return { organizations: filteredOrgs, error, mutate, isValidating };
};

type MutationData<T> = T | Promise<T> | MutatorCallback<T>;

type Orgs = Api.Query.Output<'/users/listOrgs'>;

const mutateOrganizations = (data?: MutationData<Orgs>, opts?: boolean | MutatorOptions<Orgs>) =>
  mutate<Orgs>(getOrgsKey(), data, opts);

type OrgMembers = Api.Query.Output<'/users/listOrgMembers'>;

const mutateOrganizationMembers = (
  orgSlug: string,
  data?: MutationData<OrgMembers>,
  opts?: boolean | MutatorOptions<OrgMembers>,
) => mutate<OrgMembers>(getOrgMembersKey(orgSlug), data, opts);

export const useOrgsWithOnlyAdmin = () => {
  const { identity } = useAuth();
  const { data, error, mutate, isValidating } = useSWR(
    identity ? ['/users/listOrgsWithOnlyAdmin' as const, identity.uid] : null,
    (key) => authenticatedPost<'/users/listOrgsWithOnlyAdmin'>(key),
  );

  return { organizations: data, error, mutate, isValidating };
};

const getCreateOrgMessage = (code: UserError) => {
  switch (code) {
    case UserError.MISSING_ORG_NAME:
      return 'A name must be provided when creating a shared org';
    case UserError.NAME_CONFLICT:
      return 'An org with this name already exists';
  }
};

const createOrgMutationOptions = (user?: User): MutationOptions<'/users/createOrg'> => ({
  onSuccess: (createdOrg: Api.Mutation.Output<'/users/createOrg'>) => {
    if (user && user.uid && user.email) {
      mutateOrganizationMembers(createdOrg.slug, [
        {
          role: 'ADMIN',
          orgSlug: createdOrg.slug,
          isInvite: false,
          user: {
            uid: user.uid,
            email: user.email,
          },
        },
      ]);
    }
    mutateOrganizations((organizations) => organizations && [...organizations, createdOrg], {
      revalidate: false,
    });
    openSuccessToast(`Organization "${createdOrg.name}" created`);
  },
  onError: (error) => openUserErrorToast(parseError(error, getCreateOrgMessage)),
});

export const useCreateOrg = () => {
  const account = useAccount();
  return useMutation('/users/createOrg', createOrgMutationOptions(account.user));
};

const updateOrgMembersCache = (orgSlug: string, uid: string, role: OrgMembers[number]['role']) => {
  let prevRole: OrgMembers[number]['role'] | undefined;
  mutate<OrgMembers>(
    getOrgMembersKey(orgSlug),
    (members) => {
      if (!members) {
        return;
      }
      const matchedMemberIndex = members.findIndex((member) => member.user.uid === uid);
      if (matchedMemberIndex === -1) {
        return;
      }
      prevRole = members[matchedMemberIndex].role;
      return [
        ...members.slice(0, matchedMemberIndex),
        { ...members[matchedMemberIndex], role },
        ...members.slice(matchedMemberIndex + 1),
      ];
    },
    { revalidate: false },
  );
  return prevRole;
};

const getUserRoleChangeMessage = (code: UserError) => {
  switch (code) {
    case UserError.PERMISSION_DENIED:
      return 'Non-admin attempted to change org role';
    case UserError.BAD_ORG_PERSONAL:
      return 'Roles cannot be managed on personal orgs';
    case UserError.BAD_USER:
      return 'UID invalid or user not a member of org';
    case UserError.ORG_FINAL_ADMIN:
      return 'Cannot change role of only admin';
  }
};

const createChangeUserRoleMutationOptions = (
  orgSlug: string,
): MutationOptions<'/users/changeOrgRole', OrgMembers[number]['role'] | undefined> => ({
  onSuccess: (_result, { role }) => openSuccessToast(`Role changed to ${role}`),
  onMutate: ({ user, role }) => updateOrgMembersCache(orgSlug, user, role),
  onError: (error, { user }, prevRole) => {
    if (prevRole) {
      updateOrgMembersCache(orgSlug, user, prevRole);
    }
    openUserErrorToast(parseError(error, getUserRoleChangeMessage));
  },
});

export const useChangeUserRoleInOrg = (orgSlug: string) =>
  useMutation('/users/changeOrgRole', createChangeUserRoleMutationOptions(orgSlug));

const getRemoveFromOrgMessage = (code: UserError) => {
  switch (code) {
    case UserError.PERMISSION_DENIED:
      return 'Non-admin attempted to remove another user';
    case UserError.BAD_ORG:
      return 'User cannot be removed from personal orgs';
    case UserError.ORG_FINAL_ADMIN:
      return 'Cannot remove only admin';
  }
};

const createLeaveOrgMutationOptions = (orgSlug: string): MutationOptions<'/users/removeFromOrg'> => ({
  onSuccess: () => {
    mutateOrganizations(
      (organizations) => {
        if (!organizations) {
          return;
        }
        return organizations.filter((organization) => organization.slug !== orgSlug);
      },
      { revalidate: false },
    );
    openSuccessToast('Organization is left');
  },
  onError: (error) => openUserErrorToast(parseError(error, getRemoveFromOrgMessage)),
});

export const useLeaveOrg = (orgSlug: string) =>
  useMutation('/users/removeFromOrg', createLeaveOrgMutationOptions(orgSlug));

const getInviteMemberMessage = (code: UserError) => {
  switch (code) {
    case UserError.PERMISSION_DENIED:
      return 'User does not have invite permissions';
    case UserError.BAD_ORG:
      return 'Users cannot be invited to personal orgs';
    case UserError.ORG_INVITE_DUPLICATE:
      return 'An invite already exists for this org and email';
    case UserError.ORG_INVITE_ALREADY_MEMBER:
      return 'The user is already a member of the org';
  }
};

const createInviteUserMutationOptions = (orgSlug: string): MutationOptions<'/users/inviteToOrg'> => ({
  onSuccess: (_result, { email, role }) => {
    mutateOrganizationMembers(
      orgSlug,
      (members) =>
        members && [
          ...members,
          {
            isInvite: true,
            orgSlug,
            role,
            user: {
              uid: null,
              email,
            },
          },
        ],
      { revalidate: false },
    );
    openSuccessToast(`User ${email} is invited as ${role}`);
  },
  onError: (error) => openUserErrorToast(parseError(error, getInviteMemberMessage)),
});

export const useInviteMemberToOrg = (orgSlug: string) =>
  useMutation('/users/inviteToOrg', createInviteUserMutationOptions(orgSlug));

const getRemoveInviteMessage = (code: UserError) => {
  switch (code) {
    case UserError.PERMISSION_DENIED:
      return 'User does not have invite permissions';
    case UserError.BAD_ORG:
      return 'User invites do not exist on personal orgs';
    case UserError.BAD_ORG_INVITE:
      return 'Org invite not found';
  }
};

const createRekoveInviteMutationOptions = (orgSlug: string): MutationOptions<'/users/removeOrgInvite'> => ({
  onSuccess: (_result, { email }) => {
    mutateOrganizationMembers(
      orgSlug,
      (members) => members && members.filter((member) => member.user.email !== email),
      { revalidate: false },
    );
    openSuccessToast(`${email}'s invite is revoked`);
  },
  onError: (error) => openUserErrorToast(parseError(error, getRemoveInviteMessage)),
});

export const useRemoveOrgInvite = (orgSlug: string) =>
  useMutation('/users/removeOrgInvite', createRekoveInviteMutationOptions(orgSlug));

const createRemoveUserMutationOptions = (orgSlug: string): MutationOptions<'/users/removeFromOrg'> => ({
  onSuccess: (_result, { user }) => {
    mutateOrganizationMembers(orgSlug, (members) => members && members.filter((member) => member.user.uid !== user), {
      revalidate: false,
    });
    openSuccessToast('User is removed from organization');
  },
  onError: (error) => openUserErrorToast(parseError(error, getRemoveInviteMessage)),
});

export const useRemoveUserFromOrg = (orgSlug: string) =>
  useMutation('/users/removeFromOrg', createRemoveUserMutationOptions(orgSlug));

const getDeleteOrgMessage = (code: UserError) => {
  switch (code) {
    case UserError.BAD_ORG_PERSONAL:
      return 'Personal orgs cannot be deleted';
    case UserError.PERMISSION_DENIED:
      return 'Non-admin user attempted to delete org';
  }
};

const createDeleteOrgMutationOptions = (orgSlug: string): MutationOptions<'/users/deleteOrg'> => ({
  onSuccess: (_result, { org }) => {
    mutateOrganizationMembers(orgSlug);
    mutateOrganizations((orgs) => orgs && orgs.filter((org) => org.slug !== orgSlug), {
      revalidate: false,
    });
    openSuccessToast(`Organization "${org}" deleted`);
  },
  onError: (error) => openUserErrorToast(parseError(error, getDeleteOrgMessage)),
});

export const useDeleteOrg = (orgSlug: string) =>
  useMutation('/users/deleteOrg', createDeleteOrgMutationOptions(orgSlug));

const acceptOrgInviteOptions: MutationOptions<'/users/acceptOrgInvite'> = {
  onSuccess: () => mutateOrganizations(),
};

export const useAcceptOrgInvite = () => useMutation('/users/acceptOrgInvite', acceptOrgInviteOptions);

export const useSelectedOrg = (orgSlug: string, filterPersonal: boolean) => {
  const { organizations } = useOrganizations(filterPersonal);
  return organizations?.find((organization) => organization.slug === orgSlug);
};
