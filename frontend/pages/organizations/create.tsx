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
import {
  mutateOrganizationMembers,
  mutateOrganizations,
  openSuccessToast,
  openUserErrorToast,
  parseError,
  UserError,
} from '@/hooks/organizations';
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

const CreateOrganization: NextPageWithLayout = () => {
  const router = useRouter();
  const closeDialog = useCallback(() => router.replace('/organizations'), [router]);
  const form = useForm<{ name: string }>();
  const createOrgMutation = useMutation('/users/createOrg', {
    onSuccess: (createdOrg) => {
      mutateOrganizationMembers(createdOrg.slug, [
        {
          role: 'ADMIN',
          orgSlug: createdOrg.slug,
          isInvite: false,
          user: createdOrg.user,
        },
      ]);
      mutateOrganizations((organizations) => organizations && [...organizations, createdOrg], {
        revalidate: false,
      });
      openSuccessToast(`Organization "${createdOrg.name}" created`);
      router.replace(`/organizations/${createdOrg.slug}`);
    },
    onError: (error) => openUserErrorToast(parseError(error, getCreateOrgMessage)),
  });

  return (
    <Flex stack gap="l" justify="center" align="center" css={{ flex: 1 }}>
      <Card css={{ width: 'initial' }}>
        <Form.Root onSubmit={form.handleSubmit(createOrgMutation.mutate)}>
          <Flex stack>
            <H1>Add Organization</H1>
            <Text>This will allow you to collaborate with other users on multiple projects.</Text>
            <Form.Group>
              <Form.FloatingLabelInput
                label="Organization name"
                isInvalid={!!form.formState.errors.name}
                stableId={StableId.CREATE_ORGANIZATION_NAME_INPUT}
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
                onClick={form.handleSubmit(createOrgMutation.mutate)}
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
