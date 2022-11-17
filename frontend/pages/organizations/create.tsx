import { useRouter } from 'next/router';
import React, { useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/lib/Button';
import { Card } from '@/components/lib/Card';
import { Flex } from '@/components/lib/Flex';
import * as Form from '@/components/lib/Form';
import { H1 } from '@/components/lib/Heading';
import { Text } from '@/components/lib/Text';
import { useOrganizationsLayout } from '@/hooks/layouts';
import { useCreateOrg } from '@/hooks/organizations';
import { StableId } from '@/utils/stable-ids';
import type { NextPageWithLayout } from '@/utils/types';

const CreateOrganization: NextPageWithLayout = () => {
  const router = useRouter();
  const closeDialog = useCallback(() => router.replace('/organizations'), [router]);
  const form = useForm<{ name: string }>();
  const { mutate: createOrganization, isLoading: loading, result } = useCreateOrg();
  useEffect(() => {
    if (result) {
      router.replace(`/organizations/${result.slug}`);
    }
  }, [result, router]);

  return (
    <Flex stack gap="l" justify="center" align="center" css={{ flex: 1 }}>
      <Card css={{ width: 'initial' }}>
        <Form.Root onSubmit={form.handleSubmit(createOrganization)}>
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
                loading={loading}
                onClick={form.handleSubmit(createOrganization)}
              >
                Save
              </Button>
              {loading ? null : (
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
