import { useRouter } from 'next/router';
import { ChangeEvent, FormEvent, useState } from 'react';
import { Button, Form } from 'react-bootstrap';

import BorderSpinner from '../components/BorderSpinner';
import analytics from '../utils/analytics';
import { authenticatedPost } from '../utils/fetchers';
import { useRouteParam } from '../utils/hooks';
import { Project } from '../utils/interfaces';
import { useSimpleLogoutLayout } from '../utils/layouts';
import { NextPageWithLayout } from '../utils/types';

const NewProject: NextPageWithLayout = () => {
  const [projectName, setProjectName] = useState('');
  const [formEnabled, setFormEnabled] = useState(true);
  const router = useRouter();
  const isOnboarding = useRouteParam('onboarding');

  const [creationError, setCreationError] = useState('');
  const [validationError, setValidationError] = useState('');
  const [createInProgress, setCreateInProgress] = useState(false);

  function canCreate(): boolean {
    return formEnabled && !!projectName.trim() && !validationError;
  }

  async function createProject(e: FormEvent): Promise<void> {
    if (!canCreate()) {
      return;
    }
    e.preventDefault();
    setFormEnabled(false);
    try {
      router.prefetch('/project-settings');
      setCreateInProgress(true);
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
      setFormEnabled(true);
      setCreationError('Something went wrong');
    } finally {
      setCreateInProgress(false);
    }
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    setCreationError('');
    if (e?.target && e.target.value.length > 50) {
      setValidationError('Project names cannot be longer than 50 characters');
    } else if (validationError) {
      setValidationError('');
    }

    setProjectName(e.target.value);
  }

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
      <Form className="newProjectForm" onSubmit={createProject}>
        <Form.Group className="formField" controlId="projectNameInput">
          <Form.Label>Project Name</Form.Label>
          <Form.Control
            placeholder="Cool New Project"
            value={projectName}
            onChange={handleChange}
            isInvalid={!!(validationError || creationError)}
          />
          <Form.Control.Feedback type="invalid">{validationError || creationError}</Form.Control.Feedback>
        </Form.Group>
        <div className="submitRow">
          <div className="submitContainer">
            {createInProgress && <BorderSpinner />}
            <Button variant="primary" type="submit" disabled={!canCreate()}>
              Create a Project
            </Button>
          </div>
        </div>
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
