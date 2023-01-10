import { useRouter } from 'next/router';
import React, { useCallback } from 'react';
import type { SubmitHandler } from 'react-hook-form';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/lib/Button';
import { Card } from '@/components/lib/Card';
import { Container } from '@/components/lib/Container';
import { Flex } from '@/components/lib/Flex';
import * as Form from '@/components/lib/Form';
import { H2 } from '@/components/lib/Heading';
import { Section } from '@/components/lib/Section';
import { Text } from '@/components/lib/Text';
import { useApiMutation } from '@/hooks/api-mutation';
import { useOrganizationsLayout } from '@/hooks/layouts';
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

interface CreateOrganizationForm {
  name: string;
}

const CreateOrganization: NextPageWithLayout = () => {
  const router = useRouter();
  const closeDialog = useCallback(() => router.replace('/organizations'), [router]);
  const form = useForm<CreateOrganizationForm>();

  const createOrgMutation = useApiMutation('/users/createOrg', {
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

  const submit: SubmitHandler<CreateOrganizationForm> = (form) => {
    createOrgMutation.mutate(form);
  };

  return (
    <Section css={{ margin: 'auto' }}>
      <Container size="s">
        <Card>
          <Form.Root onSubmit={form.handleSubmit(submit)}>
            <Flex stack>
              <H2>Add Organization</H2>
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

              <Flex justify="spaceBetween">
                <Button
                  type="submit"
                  stableId={StableId.CREATE_ORGANIZATION_SAVE_BUTTON}
                  loading={createOrgMutation.isLoading}
                >
                  Save
                </Button>

                <Button
                  stableId={StableId.CREATE_ORGANIZATION_CANCEL_SAVE_BUTTON}
                  onClick={closeDialog}
                  color="transparent"
                >
                  Cancel
                </Button>
              </Flex>
            </Flex>
          </Form.Root>
        </Card>
      </Container>
    </Section>
  );
};

CreateOrganization.getLayout = useOrganizationsLayout;

export default CreateOrganization;
