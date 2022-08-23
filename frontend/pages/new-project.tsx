import { useRouter } from 'next/router';
import type { SubmitHandler } from 'react-hook-form';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/lib/Button';
import { Container } from '@/components/lib/Container';
import { Flex } from '@/components/lib/Flex';
import * as Form from '@/components/lib/Form';
import { H1 } from '@/components/lib/Heading';
import { Text } from '@/components/lib/Text';
import { useSimpleLogoutLayout } from '@/hooks/layouts';
import { useRouteParam } from '@/hooks/route';
import analytics from '@/utils/analytics';
import { formValidations } from '@/utils/constants';
import { authenticatedPost } from '@/utils/http';
import type { Project } from '@/utils/types';
import type { NextPageWithLayout } from '@/utils/types';

interface NewProjectFormData {
  projectName: string;
}

const NewProject: NextPageWithLayout = () => {
  const { register, handleSubmit, formState, setError } = useForm<NewProjectFormData>();
  const router = useRouter();
  const isOnboarding = useRouteParam('onboarding');

  const createProject: SubmitHandler<NewProjectFormData> = async ({ projectName }) => {
    try {
      router.prefetch('/apis?tab=keys');
      const project: Project = await authenticatedPost(
        '/projects/create',
        { name: projectName },
        { forceRefresh: true },
      );
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
              <Form.Label htmlFor="projectName">Project Name</Form.Label>
              <Form.Input
                id="projectName"
                isInvalid={!!formState.errors.projectName}
                placeholder="Cool New Project"
                {...register('projectName', formValidations.projectName)}
              />
              <Form.Feedback>{formState.errors.projectName?.message}</Form.Feedback>
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
