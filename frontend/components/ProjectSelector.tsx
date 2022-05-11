import { faCaretDown, faPlusCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { forwardRef } from 'react';
import type { AnchorProps } from 'react-bootstrap';
import { Dropdown, Placeholder } from 'react-bootstrap';

import { useProjects } from '@/hooks/projects';
import { useSelectedProject } from '@/hooks/selected-project';
import analytics from '@/utils/analytics';

import EnvironmentSelector from './EnvironmentSelector';
import TutorialBadge from './TutorialBadge';

export default function ProjectSelector() {
  const { project, selectProject } = useSelectedProject();
  const { projects } = useProjects();
  const router = useRouter();

  const otherProjectsList = projects && projects.filter((p) => p.slug !== project?.slug);
  const otherProjects = otherProjectsList?.length ? otherProjectsList : null;

  function onSelectProject(eventKey: string | null) {
    if (!projects || !eventKey || eventKey === 'new') return;

    const selection = projects.find((p) => eventKey === p.slug);

    if (selection) {
      selectProject(selection.slug);

      if (router.pathname.startsWith('/tutorials/') && !selection.tutorial) {
        router.push('/project-analytics');
      }

      analytics.track('DC Switch Project');
    }
  }

  return (
    <div className="selectorWrapper">
      <Dropdown onSelect={onSelectProject}>
        <Dropdown.Toggle as={CustomToggle}>
          <span className="toggleText">
            {project ? (
              project.name
            ) : (
              <Placeholder animation="glow">
                <Placeholder size="sm" style={{ borderRadius: '0.5em', width: '10rem' }} />
              </Placeholder>
            )}
          </span>
          {project?.tutorial && (
            <span className="tutorialBadge">
              <TutorialBadge />
            </span>
          )}
        </Dropdown.Toggle>
        <Dropdown.Menu>
          {otherProjects &&
            otherProjects.map((p) => (
              <Dropdown.Item key={p.slug} eventKey={p.slug}>
                {p.name}
                {p.tutorial && <TutorialBadge />}
              </Dropdown.Item>
            ))}
          <Dropdown.Item as="div" style={{ color: 'var(--color-primary)' }} eventKey={'new'}>
            <Link href="/pick-project">
              <a>
                <FontAwesomeIcon icon={faPlusCircle} style={{ marginRight: '0.5rem' }} />
                Create new project
              </a>
            </Link>
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
      <EnvironmentSelector />
      <style jsx>{`
        .toggleText {
          font-size: 1.5rem;
          font-weight: 800;
        }
        .tutorialBadge {
          font-size: 1rem;
        }
        .selectorWrapper {
          margin-bottom: 2.75rem;
          display: flex;
          flex-direction: row;
          justify-content: space-between;
        }
        .selectorWrapper a {
          text-decoration: none;
        }
        .selectorWrapper a:hover {
          color: inherit;
        }
      `}</style>
    </div>
  );
}

// The forwardRef is important!!
// Dropdown needs access to the DOM node in order to position the Menu
const CustomToggle = forwardRef<HTMLAnchorElement, AnchorProps>(({ children, onClick }, ref) => (
  <a
    href=""
    ref={ref}
    onClick={(e) => {
      e.preventDefault();
      onClick && onClick(e);
    }}
  >
    {children}
    <FontAwesomeIcon icon={faCaretDown} />
    <style jsx>{`
      a {
        text-decoration: none;
        font-size: 1.5rem;
      }
      a > :global(svg) {
        margin-left: 0.5rem;
      }
    `}</style>
  </a>
));
CustomToggle.displayName = 'CustomToggle';
