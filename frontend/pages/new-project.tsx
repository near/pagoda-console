import { useRouter } from 'next/router';
import { useCallback, useEffect } from 'react';
import type { SubmitHandler } from 'react-hook-form';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/lib/Button';
import { Container } from '@/components/lib/Container';
import * as DropdownMenu from '@/components/lib/DropdownMenu';
import { Flex } from '@/components/lib/Flex';
import * as Form from '@/components/lib/Form';
import { H1 } from '@/components/lib/Heading';
import { Text } from '@/components/lib/Text';
import { useSimpleLogoutLayout } from '@/hooks/layouts';
import { useOrganizations } from '@/hooks/organizations';
import { useRouteParam } from '@/hooks/route';
import analytics from '@/utils/analytics';
import { formValidations } from '@/utils/constants';
import { authenticatedPost } from '@/utils/http';
import type { Project } from '@/utils/types';
import type { NextPageWithLayout } from '@/utils/types';

const PERSONAL_ORGANIZATION_NAME = 'Personal organization';

interface NewProjectFormData {
  projectName: string;
  projectOrg: string;
}

const NewProject: NextPageWithLayout = () => {
  const { register, handleSubmit, formState, setError, getValues, watch, setValue } = useForm<NewProjectFormData>();
  const router = useRouter();
  const isOnboarding = useRouteParam('onboarding');

  const { organizations = [] } = useOrganizations(false);
  useEffect(() => {
    if (organizations.length !== 0 && !getValues('projectOrg')) {
      const personalOrg = organizations.find((organization) => organization.isPersonal);
      const selectedOrg = personalOrg || organizations[0];
      setValue('projectOrg', selectedOrg.slug);
    }
  }, [organizations, getValues, setValue]);

  const createProject: SubmitHandler<NewProjectFormData> = async ({ projectName, projectOrg }) => {
    try {
      router.prefetch('/apis?tab=keys');
      const project = await authenticatedPost<Project>('/projects/create', { name: projectName, org: projectOrg });
      analytics.track('DC Create New Project', {
        status: 'success',
        name: projectName,
      });
      await router.push(`/apis?tab=keys&project=${project.slug}`);
    } catch (e: any) {
      analytics.track('DC Create New Project', {
        status: 'failure',
        name: projectName,
        error: e.message,
      });

      if (e.statusCode === 409) {
        setError('projectName', {
          message: 'Project name is already in use',
        });
      } else {
        setError('projectName', {
          message: 'Something went wrong',
        });
      }
    }
  };

  const setProjectOrg = useCallback((value: string) => setValue('projectOrg', value), [setValue]);

  const selectedOrganizationSlug = watch('projectOrg');
  const selectedOrganization = organizations.find((organization) => organization.slug === selectedOrganizationSlug);
  const selectedOrganizationName = selectedOrganization
    ? selectedOrganization.isPersonal
      ? PERSONAL_ORGANIZATION_NAME
      : selectedOrganization.name
    : '...';

  return (
    <Container size="s">
      <Flex stack gap="l">
        <H1>New Project</H1>

        {isOnboarding && (
          <Text>
            One last thing! Before we let you loose on the Developer Console, you’ll need to create a project. Projects
            contain API keys and any smart contracts you wish to track.
          </Text>
        )}

        <Form.Root disabled={formState.isSubmitting} onSubmit={handleSubmit(createProject)}>
          <Flex stack align="end">
            <Form.Group>
              <Form.FloatingLabelInput
                label="Project Name"
                id="projectName"
                isInvalid={!!formState.errors.projectName}
                placeholder="Cool New Project"
                {...register('projectName', formValidations.projectName)}
              />
              <Form.Feedback>{formState.errors.projectName?.message}</Form.Feedback>
            </Form.Group>

            <Form.Group>
              {organizations.length > 1 ? (
                <DropdownMenu.Root>
                  <DropdownMenu.Trigger asChild>
                    <Form.FloatingLabelSelect
                      label="Organization"
                      isInvalid={!!formState.errors.projectOrg}
                      {...register('projectOrg')}
                      selection={selectedOrganizationName}
                    />
                  </DropdownMenu.Trigger>

                  <DropdownMenu.Content align="start">
                    <DropdownMenu.RadioGroup value={selectedOrganizationName} onValueChange={setProjectOrg}>
                      {organizations.map((organization) => (
                        <DropdownMenu.RadioItem
                          value={organization.slug}
                          key={organization.slug}
                          data-state={organization.slug === selectedOrganizationSlug ? 'checked' : 'unchecked'}
                        >
                          {organization.isPersonal ? PERSONAL_ORGANIZATION_NAME : organization.name}
                        </DropdownMenu.RadioItem>
                      ))}
                    </DropdownMenu.RadioGroup>
                  </DropdownMenu.Content>
                </DropdownMenu.Root>
              ) : null}
            </Form.Group>

            <Button loading={formState.isSubmitting} type="submit">
              Create Project
            </Button>
          </Flex>
        </Form.Root>
      </Flex>
    </Container>
  );
};

NewProject.getLayout = useSimpleLogoutLayout;

export default NewProject;
