import { useRouter } from 'next/router';
import React, { useCallback } from 'react';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/lib/Button';
import { Card } from '@/components/lib/Card';
import { Flex } from '@/components/lib/Flex';
import * as Form from '@/components/lib/Form';
import { H1 } from '@/components/lib/Heading';
import { Text } from '@/components/lib/Text';
import { useOrganizationsLayout } from '@/hooks/layouts';
import { useMutation } from '@/hooks/mutation';
import { openSuccessToast, openUserErrorToast, parseError, UserError } from '@/hooks/organizations';
import { useQuery } from '@/hooks/query';
import { useQueryCache } from '@/hooks/query-cache';
import { StableId } from '@/utils/stable-ids';
import type { NextPageWithLayout } from '@/utils/types';

const getCreateOrgMessage = (code: UserError) => {
  switch (code) {
    case UserError.MISSING_ORG_NAME:
      return 'A name must be provided when creating a shared org';
    case UserError.NAME_CONFLICT:
      return 'An org with this name already exists';
  }
};

type Form = { name: string };

const CreateOrganization: NextPageWithLayout = () => {
  const router = useRouter();
  const closeDialog = useCallback(() => router.replace('/organizations'), [router]);
  const form = useForm<Form>();

  const userQuery = useQuery(['/users/getAccountDetails']);
  const orgsCache = useQueryCache('/users/listOrgs');
  const orgMembersCache = useQueryCache('/users/listOrgMembers');
  const createOrgMutation = useMutation('/users/createOrg', {
    onSuccess: ({ slug: orgSlug, name, isPersonal }) => {
      if (userQuery.data && userQuery.data.uid && userQuery.data.email) {
        orgMembersCache.update({ org: orgSlug }, () => [
          {
            role: 'ADMIN',
            orgSlug,
            isInvite: false,
            user: {
              uid: userQuery.data.uid!,
              email: userQuery.data.email!,
            },
          },
        ]);
      }
      orgsCache.update(
        undefined,
        (organizations) => organizations && [...organizations, { slug: orgSlug, name, isPersonal }],
      );
      openSuccessToast(`Organization "${name}" created`);
      router.replace(`/organizations/${orgSlug}`);
    },
    onError: (error) => openUserErrorToast(parseError(error, getCreateOrgMessage)),
  });

  const createOrg = useCallback(({ name }: Form) => createOrgMutation.mutate({ name }), [createOrgMutation]);

  return (
    <Flex stack gap="l" justify="center" align="center" css={{ flex: 1 }}>
      <Card css={{ width: 'initial' }}>
        <Form.Root onSubmit={form.handleSubmit(createOrg)}>
          <Flex stack>
            <H1>Add Organization</H1>
            <Text>This will allow you to collaborate with other users on multiple projects.</Text>
            <Form.Group>
              <Form.FloatingLabelInput
                label="Organization name"
                isInvalid={!!form.formState.errors.name}
                {...form.register('name', {
                  required: 'Please enter organization name',
                  minLength: 3,
                  maxLength: 255,
                })}
              />
              <Form.Feedback>{form.formState.errors.name?.message}</Form.Feedback>
            </Form.Group>
            <Flex>
              <Button
                stableId={StableId.CREATE_ORGANIZATION_SAVE_BUTTON}
                loading={createOrgMutation.isLoading}
                onClick={form.handleSubmit(createOrg)}
              >
                Save
              </Button>
              {createOrgMutation.isLoading ? null : (
                <Button
                  stableId={StableId.CREATE_ORGANIZATION_CANCEL_SAVE_BUTTON}
                  onClick={closeDialog}
                  color="transparent"
                >
                  Cancel
                </Button>
              )}
            </Flex>
          </Flex>
        </Form.Root>
      </Card>
    </Flex>
  );
};

CreateOrganization.getLayout = useOrganizationsLayout;

export default CreateOrganization;
