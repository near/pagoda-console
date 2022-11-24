import type { Api } from '@pc/common/types/api';
import type { Projects, Users } from '@pc/common/types/core';
import type { OrgRole } from '@pc/database/clients/core';
import { useRouter } from 'next/router';
import React, { useCallback, useEffect, useState } from 'react';
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
import {
  useChangeUserRoleInOrg,
  useDeleteOrg,
  useInviteMemberToOrg,
  useLeaveOrg,
  useOrganizations,
  useOrgMembers,
  useRemoveOrgInvite,
  useRemoveUserFromOrg,
  useSelectedOrg,
} from '@/hooks/organizations';
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

type RemovingUserData =
  | {
      uid: Users.UserUid;
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
  orgSlug: Projects.OrgSlug;
  userData: RemovingUserData;
  setUserData: (data?: RemovingUserData) => void;
}) => {
  const removeInviteMutation = useRemoveOrgInvite(orgSlug);
  const removeUserMutation = useRemoveUserFromOrg(orgSlug);
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
  useEffect(() => {
    if (removeInviteMutation.status === 'success' || removeUserMutation.status === 'success') {
      setUserData(undefined);
    }
  }, [removeInviteMutation.status, removeUserMutation.status, setUserData]);

  return (
    <ConfirmModal
      cancelText="Cancel"
      confirmColor="danger"
      confirmText="Remove"
      errorText={(removeUserMutation.error as any)?.description || (removeInviteMutation.error as any)?.description}
      isProcessing={removeUserMutation.loading || removeInviteMutation.loading}
      onConfirm={removeUser}
      setErrorText={resetError}
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
  const leaveMutation = useLeaveOrg(organization.slug);

  const changeRoleMutation = useChangeUserRoleInOrg(organization.slug);

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
              <DropdownMenu.Button stableId={StableId.ORGANIZATION_MEMBER_ROLE_DROPDOWN} css={{ width: '100%' }}>
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
        isProcessing={leaveMutation.loading}
        onConfirm={() => leaveMutation.mutate({ org: organization.slug, user: self.user.uid! })}
        setErrorText={leaveMutation.reset}
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
          {...form.register('role')}
          selection={ROLE_NAMES[role]}
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

const InviteUserDialog = ({
  orgSlug,
  modalOpen,
  switchModal,
}: {
  orgSlug: Projects.OrgSlug;
  modalOpen: boolean;
  switchModal: () => void;
}) => {
  const form = useForm<InviteForm>({
    defaultValues: {
      email: '',
      role: 'COLLABORATOR',
    },
  });
  const inviteMutation = useInviteMemberToOrg(orgSlug);
  useEffect(() => {
    if (inviteMutation.status === 'success') {
      switchModal();
      form.reset();
    }
  }, [switchModal, inviteMutation.status, form]);
  return (
    <Dialog.Root open={modalOpen} onOpenChange={switchModal}>
      <Dialog.Content>
        <Flex stack>
          <H1>Add user</H1>
          <Flex>
            <InviteFormEmailInput form={form} />
            <InviteFormRoleDropdown form={form} />
          </Flex>
          <Flex>
            <Button
              stableId={StableId.ORGANIZATION_ADD_USER_BUTTON}
              loading={inviteMutation.loading}
              onClick={form.handleSubmit((data) => inviteMutation.mutate({ ...data, org: orgSlug }))}
            >
              Add user
            </Button>
            {inviteMutation.loading ? null : (
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
  const { organizations } = useOrganizations(true);
  const changeOrganization = useCallback((slug: string) => router.push(`/organizations/${slug}`), [router]);
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <Form.FloatingLabelSelect
          css={{ minWidth: 400, flex: 'initial' }}
          label="Organization"
          selection={
            organizations ? (organizations.length ? selectedOrganization?.name ?? '-' : 'No organizations') : '...'
          }
        />
      </DropdownMenu.Trigger>
      <DropdownMenu.Content width="trigger">
        <DropdownMenu.RadioGroup value={selectedOrganization?.slug} onValueChange={changeOrganization}>
          {organizations?.map((organization) => (
            <DropdownMenu.RadioItem key={organization.slug} value={organization.slug}>
              {organization.name}
            </DropdownMenu.RadioItem>
          )) ?? []}
        </DropdownMenu.RadioGroup>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
};

const OrganizationView: NextPageWithLayout = () => {
  const router = useRouter();
  const orgSlug = (useRouteParam('slug', '/organizations', true) || '') as Projects.OrgSlug;
  const { members, error, mutate: refetchOrganization } = useOrgMembers(orgSlug);
  const { identity } = useAuth();
  const self = members?.find((member) => member.user.uid === identity?.uid);
  const adminsQuantity = members?.filter((member) => member.role === 'ADMIN' && !member.isInvite).length ?? 0;

  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const switchInviteModalOpen = useCallback(() => setInviteModalOpen((open) => !open), [setInviteModalOpen]);

  const selectedOrganization = useSelectedOrg(orgSlug, true);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const switchDeleteModalOpen = useCallback(() => setDeleteModalOpen((open) => !open), [setDeleteModalOpen]);
  const deleteMutation = useDeleteOrg(orgSlug);
  useEffect(() => {
    if (deleteMutation.status === 'success') {
      router.replace('/organizations');
    }
  }, [router, deleteMutation.status]);
  const deleteOrganization = useCallback(() => {
    if (!selectedOrganization) {
      return;
    }
    deleteMutation.mutate({ org: selectedOrganization.slug });
  }, [deleteMutation, selectedOrganization]);

  return (
    <Section>
      <Flex stack gap="l" align="stretch" css={{ height: '100%' }}>
        <Flex justify="spaceBetween">
          <OrganizationsDropdown selectedOrganization={selectedOrganization} />
          {self?.role === 'ADMIN' ? (
            <Flex justify="end">
              <Button
                stableId={StableId.ORGANIZATION_OPEN_ADD_MEMBER_MODAL_BUTTON}
                color="primaryBorder"
                onClick={switchInviteModalOpen}
              >
                <FeatherIcon icon="user-plus" /> Add member
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
                isProcessing={deleteMutation.loading}
                onConfirm={deleteOrganization}
                setErrorText={deleteMutation.reset}
                setShow={setDeleteModalOpen}
                show={deleteModalOpen}
                title={`Are you sure you want to delete ${selectedOrganization?.name ?? 'organization'}?`}
              >
                <Text>You cannot undo this action. You will lose all access to the org.</Text>
              </ConfirmModal>
            </Flex>
          ) : null}
        </Flex>

        <InviteUserDialog modalOpen={inviteModalOpen} switchModal={switchInviteModalOpen} orgSlug={orgSlug} />

        {members ? (
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
                {members.map((member) => (
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
        ) : error ? (
          <>
            <Message type="error" content="An error occurred." />{' '}
            <Button stableId={StableId.ORGANIZATION_REFETCH_BUTTON} onClick={() => refetchOrganization()}>
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
