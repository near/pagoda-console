import { useRouter } from 'next/router';
import { Button, Form } from 'react-bootstrap';
import type { SubmitHandler } from 'react-hook-form';
import { useForm } from 'react-hook-form';

import BorderSpinner from '@/components/BorderSpinner';
import ProjectCard from '@/components/ProjectCard';
import { useDashboardLayout } from '@/hooks/layouts';
import analytics from '@/utils/analytics';
import { formValidations } from '@/utils/constants';
import { authenticatedPost } from '@/utils/http';
import type { Project } from '@/utils/types';
import type { NextPageWithLayout } from '@/utils/types';

interface NewProjectFormData {
  projectName: string;
}

const NewNftTutorial: NextPageWithLayout = () => {
  const { register, handleSubmit, formState, setError } = useForm<NewProjectFormData>();
  const router = useRouter();

  // Project name is tutorial name. Path is the mdx file for the tutorial.
  const createProject: SubmitHandler<NewProjectFormData> = async ({ projectName }) => {
    const path = '/tutorials/nfts/introduction';
    const tutorial = 'NFT_MARKET';
    const name = projectName;

    try {
      router.prefetch(path);
      const project: Project = await authenticatedPost('/projects/create', { name, tutorial }, { forceRefresh: true });
      analytics.track('DC Create New NFT Tutorial Project', {
        status: 'success',
        name,
      });
      router.push(`${path}?project=${project.slug}&environment=1`);
    } catch (e: any) {
      analytics.track('DC Create New NFT Tutorial Project', {
        status: 'failure',
        name,
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
      <div className="cardContainer">
        <ProjectCard
          path="/tutorials/nfts/introduction"
          title="NFT Market"
          description="Start by minting an NFT using a pre-deployed contract, then build up to a fully-fledged NFT marketplace."
          color="orange"
        />
      </div>
      <div className="contentContainer">
        <div className="headerContainer">
          <h1>{"Let's Go!"}</h1>
          <p>
            {
              "In this Zero to Hero series, you'll find a set of tutorials that will cover every aspect of a non-fungible token (NFT) smart contract. You'll start by minting an NFT using a pre-deployed contract and by the end you'll end up building a fully-fledged NFT smart contract that supports every extension."
            }
          </p>
        </div>
        <div className="formContainer">
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
                  <Button variant="primary" type="submit" disabled={isSubmitting}>
                    Create Project
                  </Button>
                  {isSubmitting && <BorderSpinner />}
                </div>
              </div>
            </fieldset>
          </Form>
        </div>
      </div>
      <style jsx>{`
        .newProjectContainer {
          display: flex;
          flex-direction: row;
          align-items: center;
          align-content: space-between;
          margin: 0 auto;
          gap: 2rem;
        }
        .contentContainer {
          margin-left: 1rem;
          flex-direction: column;
          align-items: flex-end;
          align-content: space-between;
          height: 21rem;
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
          justify-content: flex-start;
        }
        .submitContainer {
          display: flex;
          flex-direction: row;
          column-gap: 1rem;
        }
        .formContainer {
          margin-top: 3rem;
          width: 20rem;
        }
      `}</style>
    </div>
  );
};

NewNftTutorial.getLayout = useDashboardLayout;

export default NewNftTutorial;
