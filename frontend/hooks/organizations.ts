import { noop } from 'lodash-es';
import { useMemo } from 'react';
import useSWR, { mutate } from 'swr';

import { openToast } from '@/components/lib/Toast';
import type { MutationOptions } from '@/hooks/mutation';
import { useMutation } from '@/hooks/mutation';
import { useIdentity } from '@/hooks/user';
import { authenticatedPost } from '@/utils/http';
import type { Organization, OrganizationMember, OrganizationRole } from '@/utils/types';

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

type ParsedError = {
  code: UserError;
  message: string;
};

const parseError = (e: any, messageParser: (code: UserError) => string | undefined) => {
  const userError = isUserError(e.message) ? e.message : UserError.SERVER_ERROR;
  throw { code: userError, message: messageParser(userError) || DEFAULT_ERROR_MESSAGE };
};

const openSuccessToast = (message: string) => openToast({ type: 'success', title: 'Success', description: message });
const openUserErrorToast = ({ code, message }: ParsedError) =>
  openToast({ type: 'error', title: getErrorTitle(code), description: message });

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

type OrgsMutationOptions<Input = void, Result = void, M = unknown> = MutationOptions<Input, Result, M, ParsedError>;

export const useOrgMembers = (slug: string) => {
  const identity = useIdentity();
  const { data, error, mutate, isValidating } = useSWR<OrganizationMember[]>(
    identity ? ['/users/listOrgMembers', slug] : null,
    (key) => authenticatedPost(key, { org: slug }),
  );

  return { members: data, error, mutate, isValidating };
};

export const useOrganizations = (filterPersonal: boolean) => {
  const identity = useIdentity();
  const { data, error, mutate, isValidating } = useSWR<Organization[]>(identity ? '/users/listOrgs' : null, (key) =>
    authenticatedPost(key),
  );
  const filteredOrgs = useMemo(
    () => (filterPersonal ? data?.filter((org) => !org.isPersonal) : data),
    [data, filterPersonal],
  );

  return { organizations: filteredOrgs, error, mutate, isValidating };
};

export const useOrgsWithOnlyAdmin = () => {
  const identity = useIdentity();
  const { data, error, mutate, isValidating } = useSWR<Pick<Organization, 'slug' | 'name'>[]>(
    identity ? '/users/listOrgsWithOnlyAdmin' : null,
    (key) => authenticatedPost(key),
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

const orgMutationOptions: OrgsMutationOptions<{ name: string }, Organization> = {
  eventName: 'Create organization',
  mutate: ({ name }) =>
    authenticatedPost<Organization>('/users/createOrg', { name }).catch((e) => parseError(e, getCreateOrgMessage)),
  onSuccess: (createdOrg: Organization) => {
    mutate<Organization[]>('/users/listOrgs', (organizations) => organizations && [...organizations, createdOrg], {
      revalidate: false,
    });
    openSuccessToast(`Organization "${createdOrg.name}" created`);
  },
  onError: openUserErrorToast,
};

export const useCreateOrg = () => useMutation(orgMutationOptions);

const updateOrgMembersCache = (orgSlug: string, uid: string, role: OrganizationRole) => {
  let prevRole: OrganizationRole | undefined;
  mutate<OrganizationMember[]>(
    ['/users/listOrgMembers', orgSlug],
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
): OrgsMutationOptions<{ uid: string; role: OrganizationRole }, void, OrganizationRole | undefined> => ({
  eventName: 'Change user role in organization',
  mutate: ({ uid, role }) =>
    authenticatedPost<void>('/users/changeOrgRole', { org: orgSlug, user: uid, role }).catch((e) =>
      parseError(e, getUserRoleChangeMessage),
    ),
  onSuccess: (_result, { role }) => openSuccessToast(`Role changed to ${role}`),
  onMutate: ({ uid, role }) => updateOrgMembersCache(orgSlug, uid, role),
  onError: (error, { uid }, prevRole) => {
    if (prevRole) {
      updateOrgMembersCache(orgSlug, uid, prevRole);
    }
    openUserErrorToast(error);
  },
});

export const useChangeUserRoleInOrg = (orgSlug: string) =>
  useMutation(useMemo(() => createChangeUserRoleMutationOptions(orgSlug), [orgSlug]));

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

const createLeaveOrgMutationOptions = (orgSlug: string, selfUid?: string): OrgsMutationOptions => ({
  eventName: 'Leave from organization',
  mutate: selfUid
    ? () =>
        authenticatedPost<void>('/users/removeFromOrg', { org: orgSlug, user: selfUid }).catch((e) =>
          parseError(e, getRemoveFromOrgMessage),
        )
    : noop,
  onSuccess: () => {
    mutate<Organization[]>(
      '/users/listOrgs',
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
  onError: openUserErrorToast,
});

export const useLeaveOrg = (orgSlug: string) => {
  const identity = useIdentity();
  const selfUid = identity?.uid;
  return useMutation(useMemo(() => createLeaveOrgMutationOptions(orgSlug, selfUid), [orgSlug, selfUid]));
};

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

const createInviteUserMutationOptions = (
  orgSlug: string,
): OrgsMutationOptions<{ email: string; role: OrganizationRole }> => ({
  eventName: 'Invite user to organization',
  mutate: ({ email, role }) =>
    authenticatedPost<void>('/users/inviteToOrg', { org: orgSlug, email, role }).catch((e) =>
      parseError(e, getInviteMemberMessage),
    ),
  onSuccess: (_result, { email, role }) => {
    mutate<OrganizationMember[]>(
      ['/users/listOrgMembers', orgSlug],
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
  onError: openUserErrorToast,
});

export const useInviteMemberToOrg = (orgSlug: string) =>
  useMutation(useMemo(() => createInviteUserMutationOptions(orgSlug), [orgSlug]));

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

const createRekoveInviteMutationOptions = (orgSlug: string): OrgsMutationOptions<{ email: string }> => ({
  eventName: 'Revoke organization invite',
  mutate: ({ email }) =>
    authenticatedPost<void>('/users/removeOrgInvite', { org: orgSlug, email }).catch((e) =>
      parseError(e, getRemoveInviteMessage),
    ),
  onSuccess: (_result, { email }) => {
    mutate<OrganizationMember[]>(
      ['/users/listOrgMembers', orgSlug],
      (members) => members && members.filter((member) => member.user.email !== email),
      { revalidate: false },
    );
    openSuccessToast(`${email}'s invite is revoked`);
  },
  onError: openUserErrorToast,
});

export const useRemoveOrgInvite = (orgSlug: string) =>
  useMutation(useMemo(() => createRekoveInviteMutationOptions(orgSlug), [orgSlug]));

const createRemoveUserMutationOptions = (orgSlug: string): OrgsMutationOptions<{ uid: string }> => ({
  eventName: 'Remove user from organization',
  mutate: ({ uid }) =>
    authenticatedPost<void>('/users/removeFromOrg', { org: orgSlug, user: uid }).catch((e) =>
      parseError(e, getRemoveInviteMessage),
    ),
  onSuccess: (_result, { uid }) => {
    mutate<OrganizationMember[]>(
      ['/users/listOrgMembers', orgSlug],
      (members) => members && members.filter((member) => member.user.uid !== uid),
      { revalidate: false },
    );
    openSuccessToast('User is removed from organization');
  },
  onError: openUserErrorToast,
});

export const useRemoveUserFromOrg = (orgSlug: string) =>
  useMutation(useMemo(() => createRemoveUserMutationOptions(orgSlug), [orgSlug]));

const getDeleteOrgMessage = (code: UserError) => {
  switch (code) {
    case UserError.BAD_ORG_PERSONAL:
      return 'Personal orgs cannot be deleted';
    case UserError.PERMISSION_DENIED:
      return 'Non-admin user attempted to delete org';
  }
};

const createDeleteOrgMutationOptions = (orgSlug: string): OrgsMutationOptions<{ name: string }> => ({
  eventName: 'Delete organization',
  mutate: () =>
    authenticatedPost<void>('/users/deleteOrg', { org: orgSlug }).catch((e) => parseError(e, getDeleteOrgMessage)),
  onSuccess: (_result, { name }) => {
    mutate(['/users/listOrgMembers', orgSlug]);
    mutate<Organization[]>('/users/listOrgs', (orgs) => orgs && orgs.filter((org) => org.slug !== orgSlug), {
      revalidate: false,
    });
    openSuccessToast(`Organization "${name}" deleted`);
  },
  onError: openUserErrorToast,
});

export const useDeleteOrg = (orgSlug: string) =>
  useMutation(useMemo(() => createDeleteOrgMutationOptions(orgSlug), [orgSlug]));

const getInviteErrorMessage = (code: UserError) => {
  switch (code) {
    case UserError.ORG_INVITE_BAD_TOKEN:
      return 'No invite found for token';
    case UserError.ORG_INVITE_EMAIL_MISMATCH:
      return 'The token belongs to an invite for a different email address';
    case UserError.ORG_INVITE_EXPIRED:
      return 'The invite token has expired';
    case UserError.BAD_ORG:
      return 'Org is soft-deleted';
    case UserError.ORG_INVITE_ALREADY_MEMBER:
      return 'The user is already a member of the org';
  }
};

const acceptOrgInviteOptions: MutationOptions<{ token: string }, void, unknown, { code: UserError; message: string }> =
  {
    eventName: 'Accept organization invite',
    mutate: ({ token }) =>
      authenticatedPost<void>('/users/acceptOrgInvite', { token }).catch((e) => parseError(e, getInviteErrorMessage)),
    onSuccess: () => {
      mutate(['/users/listOrgMembers']);
      mutate('/users/listOrgs');
    },
  };

export const useAcceptOrgInvite = () => useMutation(acceptOrgInviteOptions);

export const useSelectedOrg = (orgSlug: string, filterPersonal: boolean) => {
  const { organizations } = useOrganizations(filterPersonal);
  return organizations?.find((organization) => organization.slug === orgSlug);
};
