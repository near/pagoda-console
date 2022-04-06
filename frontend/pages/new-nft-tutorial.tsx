import { useRouter } from 'next/router';
import type { ChangeEvent, FormEvent } from 'react';
import { useState } from 'react';
import { Button, Form } from 'react-bootstrap';

import BorderSpinner from '@/components/BorderSpinner';
import ProjectCard from '@/components/ProjectCard';
import analytics from '@/utils/analytics';
import { authenticatedPost } from '@/utils/fetchers';
import type { Project } from '@/utils/interfaces';
import { useSimpleLogoutLayout } from '@/utils/layouts';
import type { NextPageWithLayout } from '@/utils/types';

const NewNftTutorial: NextPageWithLayout = () => {
  const [projectName, setProjectName] = useState('');
  const [formEnabled, setFormEnabled] = useState(true);
  const router = useRouter();

  const [creationError, setCreationError] = useState('');
  const [validationError, setValidationError] = useState('');
  const [createInProgress, setCreateInProgress] = useState(false);

  function canCreate(): boolean {
    return formEnabled && !!projectName.trim() && !validationError;
  }

  // Project name is tutorial name. Path is the mdx file for the tutorial.
  async function createProject(e: FormEvent): Promise<void> {
    if (!canCreate()) {
      return;
    }

    e.preventDefault();
    setCreateInProgress(true);
    setFormEnabled(false);

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
                  Create Project
                </Button>
              </div>
            </div>
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

NewNftTutorial.getLayout = useSimpleLogoutLayout;

export default NewNftTutorial;
