import type { Projects } from '@pc/common/types/core';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useCallback, useEffect } from 'react';
import type { SubmitHandler } from 'react-hook-form';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/lib/Button';
import { Container } from '@/components/lib/Container';
import * as DropdownMenu from '@/components/lib/DropdownMenu';
import { FeatherIcon } from '@/components/lib/FeatherIcon';
import { Flex } from '@/components/lib/Flex';
import * as Form from '@/components/lib/Form';
import { H1 } from '@/components/lib/Heading';
import { Text } from '@/components/lib/Text';
import { TextLink } from '@/components/lib/TextLink';
import { useSimpleLogoutLayout } from '@/hooks/layouts';
import { useMutation } from '@/hooks/mutation';
import { useQuery } from '@/hooks/query';
import { useRouteParam } from '@/hooks/route';
import { formValidations } from '@/utils/constants';
import { StableId } from '@/utils/stable-ids';
import type { NextPageWithLayout } from '@/utils/types';

const PERSONAL_ORGANIZATION_NAME = 'Personal organization';

interface NewProjectFormData {
  projectName: string;
  projectOrg: Projects.OrgSlug;
}

const NewProject: NextPageWithLayout = () => {
  const { register, handleSubmit, formState, getValues, watch, setValue } = useForm<NewProjectFormData>();
  const router = useRouter();
  const isOnboarding = useRouteParam('onboarding');

  const { data: organizations = [] } = useQuery(['/users/listOrgs']);
  useEffect(() => {
    if (organizations.length !== 0 && !getValues('projectOrg')) {
      const personalOrg = organizations.find((organization) => organization.isPersonal);
      const selectedOrg = personalOrg || organizations[0];
      setValue('projectOrg', selectedOrg.slug);
    }
  }, [organizations, getValues, setValue]);
  const createProjectMutation = useMutation('/projects/create', {
    onMutate: () => router.prefetch('/apis?tab=keys'),
    onSuccess: (result) => router.push(`/apis?tab=keys&project=${result.slug}`),
    getAnalyticsSuccessData: (variables) => ({ name: variables.name }),
    getAnalyticsErrorData: (variables) => ({ name: variables.name }),
  });
  const mutationError =
    createProjectMutation.status === 'error'
      ? (createProjectMutation.error as any).statusCode === 409
        ? 'Project name is already in use'
        : 'Something went wrong'
      : undefined;

  const createProject: SubmitHandler<NewProjectFormData> = ({ projectName, projectOrg }) => {
    createProjectMutation.mutate({ name: projectName, org: projectOrg });
  };

  const setProjectOrg = useCallback((value: Projects.OrgSlug) => setValue('projectOrg', value), [setValue]);

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
        <Flex stack>
          <Link href="/pick-project" passHref>
            <TextLink stableId={StableId.NEW_PROJECT_BACK_TO_PROJECT_TYPE_LINK}>
              <FeatherIcon icon="arrow-left" /> Project Type
            </TextLink>
          </Link>

          <H1>New Project</H1>
        </Flex>

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
              <Form.Feedback>{mutationError || formState.errors.projectName?.message}</Form.Feedback>
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

            <Button stableId={StableId.NEW_PROJECT_CREATE_BUTTON} loading={formState.isSubmitting} type="submit">
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
