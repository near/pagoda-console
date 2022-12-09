import type { Api } from '@pc/common/types/api';
import type { OrgRole } from '@pc/database/clients/core';
import { useRouter } from 'next/router';
import React, { useCallback, useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { useForm } from 'react-hook-form';

import { Badge } from '@/components/lib/Badge';
import { Button } from '@/components/lib/Button';
import * as Dialog from '@/components/lib/Dialog';
import * as DropdownMenu from '@/components/lib/DropdownMenu';
import { FeatherIcon } from '@/components/lib/FeatherIcon';
import { Flex } from '@/components/lib/Flex';
import * as Form from '@/components/lib/Form';
import { H1 } from '@/components/lib/Heading';
import { Message } from '@/components/lib/Message';
import { Section } from '@/components/lib/Section';
import { Spinner } from '@/components/lib/Spinner';
import * as Table from '@/components/lib/Table';
import { Text } from '@/components/lib/Text';
import { ConfirmModal } from '@/components/modals/ConfirmModal';
import { useAuth } from '@/hooks/auth';
import { useOrganizationsLayout } from '@/hooks/layouts';
import { useMutation } from '@/hooks/mutation';
import { openSuccessToast, openUserErrorToast, parseError, UserError } from '@/hooks/organizations';
import { useQuery } from '@/hooks/query';
import { useQueryCache } from '@/hooks/query-cache';
import { useRouteParam } from '@/hooks/route';
import { styled } from '@/styles/stitches';
import { formValidations } from '@/utils/constants';
import { StableId } from '@/utils/stable-ids';
import type { NextPageWithLayout } from '@/utils/types';

const ROLES: OrgRole[] = ['COLLABORATOR', 'ADMIN'];

const ROLE_NAMES: Record<OrgRole, string> = {
  COLLABORATOR: 'Collaborator',
  ADMIN: 'Admin',
};

const Trigger = styled('div', {
  cursor: 'pointer',
  color: 'var(--color-text-1)',

  '&:hover': {
    color: 'var(--color-primary)',
  },

  variants: {
    disabled: {
      true: {
        cursor: 'not-allowed',
        color: 'var(--color-text-3)',

        '&:hover': {
          color: 'var(--color-text-3)',
        },
      },
    },
  },
});

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

type RemovingUserData =
  | {
      uid: string;
      email: string;
    }
  | {
      email: string;
    };

const RemoveUserDialog = ({
  orgSlug,
  userData,
  setUserData,
}: {
  orgSlug: string;
  userData: RemovingUserData;
  setUserData: (data?: RemovingUserData) => void;
}) => {
  const orgMembersCache = useQueryCache('/users/listOrgMembers');
  const removeInviteMutation = useMutation('/users/removeOrgInvite', {
    onSuccess: (_result, { email, org: orgSlug }) => {
      orgMembersCache.update(
        { org: orgSlug },
        (members) => members && members.filter((member) => member.user.email !== email),
      );
      openSuccessToast(`${email}'s invite is revoked`);
      setUserData(undefined);
    },
    onError: (error) => openUserErrorToast(parseError(error, getRemoveInviteMessage)),
  });
  const removeUserMutation = useMutation('/users/removeFromOrg', {
    onSuccess: (_result, { user, org: orgSlug }) => {
      orgMembersCache.update(
        { org: orgSlug },
        (members) => members && members.filter((member) => member.user.uid !== user),
      );
      openSuccessToast('User is removed from organization');
      setUserData(undefined);
    },
    onError: (error) => openUserErrorToast(parseError(error, getRemoveInviteMessage)),
  });
  const resetRemovingUserData = useCallback(() => setUserData(undefined), [setUserData]);
  const removeUser = useCallback(() => {
    if (!userData) {
      return;
    }
    if ('uid' in userData) {
      removeUserMutation.mutate({ user: userData.uid, org: orgSlug });
    } else {
      removeInviteMutation.mutate({ email: userData.email, org: orgSlug });
    }
  }, [removeInviteMutation, removeUserMutation, userData, orgSlug]);
  const resetError = useCallback(() => {
    removeInviteMutation.reset();
    removeUserMutation.reset();
  }, [removeInviteMutation, removeUserMutation]);

  return (
    <ConfirmModal
      cancelText="Cancel"
      confirmColor="danger"
      confirmText="Remove"
      errorText={(removeUserMutation.error as any)?.description || (removeInviteMutation.error as any)?.description}
      isProcessing={removeUserMutation.isLoading || removeInviteMutation.isLoading}
      onConfirm={removeUser}
      resetError={resetError}
      setShow={resetRemovingUserData}
      show={Boolean(userData)}
      title={`Are you sure you want to remove ${userData.email}?`}
    >
      <Text>You cannot undo this action. The user will lose all access to the org.</Text>
    </ConfirmModal>
  );
};

type Organization = Api.Query.Output<'/users/listOrgs'>[number];
type OrgMember = Api.Query.Output<'/users/listOrgMembers'>[number];

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

const OrganizationMemberView = ({
  organization,
  member,
  self,
  singleAdmin,
}: {
  organization: Organization;
  member: OrgMember;
  self: OrgMember;
  singleAdmin: boolean;
}) => {
  const [leavingModalOpen, setLeavingModalOpen] = useState(false);
  const orgsCache = useQueryCache('/users/listOrgs');
  const leaveMutation = useMutation('/users/removeFromOrg', {
    onSuccess: (_result, variables) => {
      orgsCache.update(undefined, (organizations) => {
        if (!organizations) {
          return;
        }
        return organizations.filter((organization) => organization.slug !== variables.org);
      });
      openSuccessToast('Organization is left');
    },
    onError: (error) => openUserErrorToast(parseError(error, getRemoveFromOrgMessage)),
  });

  const orgMembersCache = useQueryCache('/users/listOrgMembers');
  const changeRoleMutation = useMutation('/users/changeOrgRole', {
    onSuccess: (_result, { role }) => openSuccessToast(`Role changed to ${role}`),
    onMutate: ({ user: userUid, role, org: orgSlug }) => {
      let modifiedRole;
      orgMembersCache.update({ org: orgSlug }, (prevMembers) => {
        if (!prevMembers) {
          return;
        }
        return prevMembers.map((member) => {
          if (member.user.uid === userUid) {
            modifiedRole = member.role;
            return { ...member, role };
          }
          return member;
        });
      });
      return modifiedRole;
    },
    onError: (error, { user: userUid, org: orgSlug }, prevRole) => {
      if (prevRole) {
        orgMembersCache.update({ org: orgSlug }, (prevMembers) => {
          if (!prevMembers) {
            return;
          }
          return prevMembers.map((member) => {
            if (member.user.uid === userUid) {
              return { ...member, role: prevRole };
            }
            return member;
          });
        });
      }
      openUserErrorToast(parseError(error, getUserRoleChangeMessage));
    },
  });

  const [removingUserData, setRemovingUserData] = useState<RemovingUserData>();
  const setRemovingUser = useCallback(
    () => setRemovingUserData(member.user.uid ? member.user : { email: member.user.email }),
    [setRemovingUserData, member],
  );

  const leavingDisabled = singleAdmin && self.role === 'ADMIN';
  return (
    <Table.Row>
      <Table.Cell>
        <Flex>
          <Flex gap="none" stack autoWidth>
            <Text weight="semibold" color="text1">
              {member.user.email}
            </Text>
          </Flex>
          {member.isInvite ? <Badge color="primary">Invited</Badge> : null}
        </Flex>
      </Table.Cell>
      <Table.Cell css={{ width: 250 }}>
        {self.role !== 'ADMIN' ? (
          <Text>{ROLE_NAMES[member.role]}</Text>
        ) : (
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild disabled={!member.user.uid || (singleAdmin && member.role === 'ADMIN')}>
              <DropdownMenu.Button stableId={StableId.ORGANIZATION_MEMBER_ROLE_DROPDOWN} size="s">
                {ROLE_NAMES[member.role]}
              </DropdownMenu.Button>
            </DropdownMenu.Trigger>

            <DropdownMenu.Content align="start">
              <DropdownMenu.RadioGroup
                value={member.role}
                onValueChange={(value) =>
                  changeRoleMutation.mutate({ user: member.user.uid!, role: value as OrgRole, org: organization.slug })
                }
              >
                {ROLES.map((role) => (
                  <DropdownMenu.RadioItem value={role} key={role}>
                    {ROLE_NAMES[role]}
                  </DropdownMenu.RadioItem>
                ))}
              </DropdownMenu.RadioGroup>
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        )}
      </Table.Cell>
      <Table.Cell css={{ width: 48 }}>
        {self.user.uid === member.user.uid ? (
          <Trigger disabled={leavingDisabled}>
            <FeatherIcon icon="log-out" onClick={leavingDisabled ? undefined : () => setLeavingModalOpen(true)} />
          </Trigger>
        ) : self.role === 'ADMIN' ? (
          <Trigger>
            <FeatherIcon icon="trash-2" onClick={setRemovingUser} />
          </Trigger>
        ) : null}
      </Table.Cell>
      {removingUserData ? (
        <RemoveUserDialog orgSlug={organization.slug} userData={removingUserData} setUserData={setRemovingUserData} />
      ) : null}
      <ConfirmModal
        cancelText="Cancel"
        confirmColor="danger"
        confirmText="Remove"
        errorText={(leaveMutation.error as any)?.description}
        isProcessing={leaveMutation.isLoading}
        onConfirm={() => leaveMutation.mutate({ org: organization.slug, user: self.user.uid! })}
        resetError={leaveMutation.reset}
        setShow={setLeavingModalOpen}
        show={leavingModalOpen}
        title={`Are you sure you want to leave ${organization.name}?`}
      >
        <Text>You cannot undo this action. You will lose all access to the org.</Text>
      </ConfirmModal>
    </Table.Row>
  );
};

type InviteForm = { email: string; role: OrgRole };

const InviteFormEmailInput = ({ form }: { form: UseFormReturn<InviteForm> }) => {
  return (
    <Flex stack align="stretch">
      <Form.FloatingLabelInput
        label="Email"
        type="email"
        isInvalid={!!form.formState.errors.email}
        stableId={StableId.ORGANIZATION_INVITE_EMAIL_INPUT}
        {...form.register('email', formValidations.email)}
      />
      <Form.Feedback>{form.formState.errors.email?.message}</Form.Feedback>
    </Flex>
  );
};

const InviteFormRoleDropdown = ({ form }: { form: UseFormReturn<InviteForm> }) => {
  const role = form.watch('role');
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <Form.FloatingLabelSelect
          label="Role"
          isInvalid={!!form.formState.errors.role}
          selection={ROLE_NAMES[role]}
          stableId={StableId.ORGANIZATION_INVITE_ROLE_SELECT}
          {...form.register('role')}
        />
      </DropdownMenu.Trigger>

      <DropdownMenu.Content align="start">
        <DropdownMenu.RadioGroup value={role} onValueChange={(value) => form.setValue('role', value as OrgRole)}>
          {ROLES.map((role) => (
            <DropdownMenu.RadioItem value={role} key={role}>
              {ROLE_NAMES[role]}
            </DropdownMenu.RadioItem>
          ))}
        </DropdownMenu.RadioGroup>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
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

const InviteUserDialog = ({
  orgSlug,
  modalOpen,
  switchModal,
}: {
  orgSlug: string;
  modalOpen: boolean;
  switchModal: () => void;
}) => {
  const form = useForm<InviteForm>({
    defaultValues: {
      email: '',
      role: 'COLLABORATOR',
    },
  });
  const orgMembersCache = useQueryCache('/users/listOrgMembers');
  const inviteMutation = useMutation('/users/inviteToOrg', {
    onSuccess: (_result, { email, role, org: orgSlug }) => {
      orgMembersCache.update(
        { org: orgSlug },
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
      );
      openSuccessToast(`User ${email} is invited as ${role}`);
      switchModal();
      form.reset();
    },
    onError: (error) => openUserErrorToast(parseError(error, getInviteMemberMessage)),
  });
  return (
    <Dialog.Root open={modalOpen} onOpenChange={switchModal}>
      <Dialog.Content>
        <Flex stack gap="l">
          <H1>Add user</H1>
          <Flex align="stretch" stack={{ '@tablet': true }}>
            <InviteFormEmailInput form={form} />
            <InviteFormRoleDropdown form={form} />
          </Flex>
          <Flex justify="spaceBetween">
            <Button
              stableId={StableId.ORGANIZATION_ADD_USER_BUTTON}
              loading={inviteMutation.isLoading}
              onClick={form.handleSubmit((data) => inviteMutation.mutate({ ...data, org: orgSlug }))}
            >
              Add user
            </Button>
            {inviteMutation.isLoading ? null : (
              <Button stableId={StableId.ORGANIZATION_CANCEL_ADD_USER_BUTTON} onClick={switchModal} color="transparent">
                Cancel
              </Button>
            )}
          </Flex>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
};

const OrganizationsDropdown = ({ selectedOrganization }: { selectedOrganization?: Organization }) => {
  const router = useRouter();
  const orgsQuery = useQuery(['/users/listOrgs']);
  const nonPersonalOrgs = orgsQuery.status === 'success' ? orgsQuery.data.filter((org) => !org.isPersonal) : [];
  const changeOrganization = useCallback((slug: string) => router.push(`/organizations/${slug}`), [router]);

  function onSelectNewOrganization() {
    router.push('/organizations/create');
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <Form.FloatingLabelSelect
          label="Organization"
          css={{ marginRight: 'auto', maxWidth: '25rem' }}
          selection={
            orgsQuery.status === 'success'
              ? nonPersonalOrgs.length
                ? selectedOrganization?.name ?? '-'
                : 'No organizations'
              : '...'
          }
          stableId={StableId.ORGANIZATION_SELECT}
        />
      </DropdownMenu.Trigger>

      <DropdownMenu.Content>
        <DropdownMenu.RadioGroup value={selectedOrganization?.slug} onValueChange={changeOrganization}>
          {nonPersonalOrgs.map((organization) => (
            <DropdownMenu.RadioItem key={organization.slug} value={organization.slug}>
              {organization.name}
            </DropdownMenu.RadioItem>
          ))}
        </DropdownMenu.RadioGroup>

        <DropdownMenu.ContentStickyFooter>
          <DropdownMenu.Item color="primary" onSelect={() => onSelectNewOrganization()}>
            <FeatherIcon icon="plus" />
            Create New Organization
          </DropdownMenu.Item>
        </DropdownMenu.ContentStickyFooter>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
};

const getDeleteOrgMessage = (code: UserError) => {
  switch (code) {
    case UserError.BAD_ORG_PERSONAL:
      return 'Personal orgs cannot be deleted';
    case UserError.PERMISSION_DENIED:
      return 'Non-admin user attempted to delete org';
  }
};

const OrganizationView: NextPageWithLayout = () => {
  const router = useRouter();
  const orgSlug = useRouteParam('slug', '/organizations', true) || '';
  const orgsQuery = useQuery(['/users/listOrgs']);
  const membersQuery = useQuery(['/users/listOrgMembers', { org: orgSlug }]);
  const { identity } = useAuth();
  const self = membersQuery.data?.find((member) => member.user.uid === identity?.uid);
  const adminsQuantity = membersQuery.data?.filter((member) => member.role === 'ADMIN' && !member.isInvite).length ?? 0;

  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const switchInviteModalOpen = useCallback(() => setInviteModalOpen((open) => !open), [setInviteModalOpen]);

  const selectedOrganization = orgsQuery.data?.find((org) => org.slug === orgSlug);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const switchDeleteModalOpen = useCallback(() => setDeleteModalOpen((open) => !open), [setDeleteModalOpen]);
  const deleteMutation = useMutation('/users/deleteOrg', {
    onSuccess: (_result, { org: orgSlug }) => {
      openSuccessToast(`Organization "${selectedOrganization?.name}" deleted`);
      membersQuery.invalidateCache();
      orgsQuery.updateCache((orgs) => orgs && orgs.filter((org) => org.slug !== orgSlug));
      router.replace('/organizations');
    },
    onError: (error) => openUserErrorToast(parseError(error, getDeleteOrgMessage)),
  });
  const deleteOrganization = useCallback(() => {
    if (!selectedOrganization) {
      return;
    }
    deleteMutation.mutate({ org: selectedOrganization.slug });
  }, [deleteMutation, selectedOrganization]);

  return (
    <Section>
      <Flex stack gap="l" align="stretch" css={{ height: '100%' }}>
        <Flex>
          <OrganizationsDropdown selectedOrganization={selectedOrganization} />

          {self?.role === 'ADMIN' ? (
            <>
              <Button
                stableId={StableId.ORGANIZATION_OPEN_ADD_MEMBER_MODAL_BUTTON}
                color="primaryBorder"
                onClick={switchInviteModalOpen}
                hideText="tablet"
              >
                <FeatherIcon icon="user-plus" />
                Add Member
              </Button>

              <Button
                stableId={StableId.ORGANIZATION_OPEN_DELETE_ORGANIZATION_MODAL_BUTTON}
                color="neutral"
                onClick={switchDeleteModalOpen}
                disabled={!selectedOrganization}
              >
                <FeatherIcon icon="trash-2" />
              </Button>

              <ConfirmModal
                cancelText="Cancel"
                confirmColor="danger"
                confirmText="Delete"
                errorText={(deleteMutation.error as any)?.description}
                isProcessing={deleteMutation.isLoading}
                onConfirm={deleteOrganization}
                resetError={deleteMutation.reset}
                setShow={setDeleteModalOpen}
                show={deleteModalOpen}
                title={`Are you sure you want to delete ${selectedOrganization?.name ?? 'organization'}?`}
              >
                <Text>You cannot undo this action. You will lose all access to the org.</Text>
              </ConfirmModal>
            </>
          ) : null}
        </Flex>

        <InviteUserDialog modalOpen={inviteModalOpen} switchModal={switchInviteModalOpen} orgSlug={orgSlug} />

        {membersQuery.status === 'success' ? (
          self === undefined || !selectedOrganization ? (
            <Message type="error" content="You are not a part of this organization." />
          ) : (
            <Table.Root>
              <Table.Head css={{ top: 0 }}>
                <Table.Row>
                  <Table.HeaderCell>Name</Table.HeaderCell>
                  <Table.HeaderCell>Role</Table.HeaderCell>
                  <Table.HeaderCell></Table.HeaderCell>
                </Table.Row>
              </Table.Head>

              <Table.Body>
                {membersQuery.data.map((member) => (
                  <OrganizationMemberView
                    key={member.user.email}
                    organization={selectedOrganization}
                    member={member}
                    self={self}
                    singleAdmin={adminsQuantity <= 1}
                  />
                ))}
              </Table.Body>
            </Table.Root>
          )
        ) : membersQuery.status === 'error' ? (
          <>
            <Message type="error" content="An error occurred." />{' '}
            <Button stableId={StableId.ORGANIZATION_REFETCH_BUTTON} onClick={() => orgsQuery.invalidateCache()}>
              Refetch
            </Button>
          </>
        ) : (
          <Spinner center />
        )}
      </Flex>
    </Section>
  );
};

OrganizationView.getLayout = useOrganizationsLayout;

export default OrganizationView;
