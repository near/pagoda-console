import { faTrashAlt } from '@fortawesome/free-regular-svg-icons';
import { faAngleDoubleRight, faExclamationCircle, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Alert, Button } from 'react-bootstrap';

import BorderSpinner from '@/components/BorderSpinner';
import DeleteProjectModal from '@/components/modals/DeleteProjectModal';
import TutorialBadge from '@/components/TutorialBadge';
import { useProjects } from '@/utils/fetchers';
import type { Project } from '@/utils/interfaces';
import { useSimpleLogoutLayout } from '@/utils/layouts';
import type { NextPageWithLayout } from '@/utils/types';

const Projects: NextPageWithLayout = () => {
  const router = useRouter();
  const { projects, error, isValidating, mutate: refetchProjects } = useProjects();
  const [isEditing, setIsEditing] = useState(false);
  const [showRedirectAlert, setShowRedirectAlert] = useState(false);

  useEffect(() => {
    if (window.sessionStorage.getItem('redirected') === 'true') {
      setShowRedirectAlert(true);
      // Reset global state.
      window.sessionStorage.removeItem('redirected');
    }
  }, []);

  useEffect(() => {
    router.prefetch('/pick-project');
    // Prefetch only needs to happen once. Disabling rule.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  let body;
  if (error) {
    // TODO
    body = <div>An error occurred</div>;
  } else if (!projects) {
    // TODO
    return <BorderSpinner />;
  } else if (!projects.length && !isValidating) {
    // TODO
    router.push('/pick-project?onboarding=true');
    return <></>;
  } else if (!projects.length && isValidating) {
    return <BorderSpinner />;
  } else {
    body = projects!.map((proj, index) => (
      <ProjectRow
        key={proj.id}
        project={proj}
        showDelete={isEditing}
        isTop={index === 0}
        onDelete={() => refetchProjects()}
      />
    ));
  }
  return (
    <div className="projectsContainer">
      <div className="headerContainer">
        <h1>Projects</h1>
        <div className="buttonContainer">
          <Button onClick={() => router.push('/pick-project')}>Create</Button>
          <Button onClick={() => setIsEditing(!isEditing)}>{!isEditing ? 'Edit' : 'Done'}</Button>
        </div>
      </div>
      {showRedirectAlert && (
        <div className="alertContainer">
          <RedirectAlert onClick={() => setShowRedirectAlert(false)}></RedirectAlert>
        </div>
      )}
      <div className="listContainer">{body}</div>
      <style jsx>{`
        .projectsContainer {
          width: 44rem;
        }
        .headerContainer {
          display: flex;
          flex-direction: row;
          justify-content: space-between;
          align-items: center;
        }
        .buttonContainer :global(button) {
          margin-left: 0.688rem;
        }
        .alertContainer {
          margin-top: 1.25rem;
        }
        .listContainer {
          margin-top: 2.625rem;
          /*TODO review styling for very long list */
          overflow-y: auto;
          max-height: 40rem;
        }
      `}</style>
    </div>
  );
};

function RedirectAlert(props: { onClick: () => void }) {
  return (
    <Alert variant="danger">
      <p className="alertContent">
        <FontAwesomeIcon icon={faExclamationCircle}></FontAwesomeIcon> <b>Error: </b>
        {"That project does not exist or you don't have permission to access it."}{' '}
        <span className="dismissIcon" onClick={() => props.onClick()}>
          <FontAwesomeIcon icon={faTimes}></FontAwesomeIcon>
        </span>
      </p>
      <style jsx>{`
        .alertContent {
          font-size: 0.75rem;
          line-height: 1rem;
          margin: 0px;
        }
        .dismissIcon {
          cursor: pointer;
          position: absolute;
          top: 0;
          right: 0;
          z-index: 2;
          padding: 1rem;
        }
      `}</style>
    </Alert>
  );
}

function ProjectRow(props: { project: Project; showDelete: boolean; isTop: boolean; onDelete: () => void }) {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="projectRowContainer">
      <DeleteProjectModal
        slug={props.project.slug}
        name={props.project.name}
        show={showModal}
        setShow={setShowModal}
        onDelete={props.onDelete}
      />
      <Link href={`/project-analytics?project=${props.project.slug}`}>
        <a className="projectLink">
          <div className="linkDiv">
            {props.project.name} {props.project.tutorial && <TutorialBadge size="md" />}
          </div>
          {!props.showDelete && (
            <div className="projectIcon">
              <FontAwesomeIcon icon={faAngleDoubleRight} />
            </div>
          )}
        </a>
      </Link>
      {props.showDelete && (
        <Button variant="outline-danger" onClick={() => setShowModal(true)}>
          <FontAwesomeIcon icon={faTrashAlt} />
        </Button>
      )}
      <style jsx>{`
        .projectRowContainer {
          display: flex;
          flex-direction: row;
          justify-content: space-between;
          height: 5rem;
          width: 100%;
          border-top: ${!props.isTop ? '1px solid #DEE2E6' : '0'};
          align-items: center;
          position: relative;
        }
        .projectLink:hover {
          color: var(--color-accent-green);
        }
        .projectLink {
          padding: 0;
          text-decoration: none;
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          font-size: 2rem;
          font-weight: bold;
        }
        .projectRowContainer :global(.btn) {
          margin-right: 0.5rem;
        }
        .projectIcon {
          font-size: 2rem;
          position: absolute;
          right: 1rem;
          top: 1rem;
        }
      `}</style>
    </div>
  );
}

Projects.getLayout = useSimpleLogoutLayout;

export default Projects;
