import { useRouter } from 'next/router';
import { Button, Form } from 'react-bootstrap';
import type { SubmitHandler } from 'react-hook-form';
import { useForm } from 'react-hook-form';

import BorderSpinner from '@/components/BorderSpinner';
import analytics from '@/utils/analytics';
import { formValidations } from '@/utils/constants';
import { authenticatedPost } from '@/utils/fetchers';
import { useRouteParam } from '@/utils/hooks';
import type { Project } from '@/utils/interfaces';
import { useSimpleLogoutLayout } from '@/utils/layouts';
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
      router.prefetch('/project-settings');
      const project: Project = await authenticatedPost(
        '/projects/create',
        { name: projectName },
        { forceRefresh: true },
      );
      analytics.track('DC Create New Project', {
        status: 'success',
        name: projectName,
      });
      router.push(`/project-settings?project=${project.slug}&onboarding=true`);
    } catch (e: any) {
      analytics.track('DC Create New Project', {
        status: 'failure',
        name: projectName,
        error: e.message,
      });
      setError('projectName', {
        message: 'Something went wrong',
      });
    }
  };

  const isSubmitting = formState.isSubmitting || formState.isSubmitSuccessful;

  return (
    <div className="newProjectContainer">
      <h1>New Project</h1>
      {isOnboarding && (
        <div className="calloutText">
          <span className="boldText">One last thing! </span>
          Before we let you loose on the Developer Console, you’ll need to create a project. Projects contain API keys
          and any smart contracts you wish to track.
        </div>
      )}

      <Form noValidate className="newProjectForm" onSubmit={handleSubmit(createProject)}>
        <fieldset disabled={isSubmitting}>
          <Form.Group className="formField" controlId="projectNameInput">
            <Form.Label>Project Name</Form.Label>
            <Form.Control
              isInvalid={!!formState.errors.projectName}
              placeholder="Cool New Project"
              {...register('projectName', formValidations.projectName)}
            />
            <Form.Control.Feedback type="invalid">{formState.errors.projectName?.message}</Form.Control.Feedback>
          </Form.Group>

          <div className="submitRow">
            <div className="submitContainer">
              {isSubmitting && <BorderSpinner />}
              <Button variant="primary" type="submit" disabled={isSubmitting}>
                Create a Project
              </Button>
            </div>
          </div>
        </fieldset>
      </Form>

      <style jsx>{`
        .newProjectContainer {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 34rem;
          margin: 0 auto;
        }
        .newProjectContainer :global(.newProjectForm) {
          width: 100%;
        }
        .newProjectContainer :global(.formField) {
          margin-bottom: 1rem;
        }
        h1 {
          margin-bottom: 1.25rem;
          width: 100%;
        }
        .calloutText {
          margin-bottom: 1rem;
        }
        .boldText {
          font-weight: 700;
        }
        .submitRow {
          width: 100%;
          display: flex;
          justify-content: flex-end;
        }
        .submitContainer {
          display: flex;
          flex-direction: row;
          column-gap: 1rem;
        }
      `}</style>
    </div>
  );
};

NewProject.getLayout = useSimpleLogoutLayout;

export default NewProject;
