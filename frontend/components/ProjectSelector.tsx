import { ReactNode, forwardRef } from 'react';
import { AnchorProps, Dropdown, Placeholder } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useProject, useProjects } from '../utils/fetchers';
import { useRouteParam } from "../utils/hooks";
import Link from 'next/link';
import { faCaretDown, faPlusCircle } from '@fortawesome/free-solid-svg-icons'
import ProjectLink from './ProjectLink';
import EnvironmentSelector from './EnvironmentSelector';
import mixpanel from 'mixpanel-browser';
import TutorialBadge from './TutorialBadge';

export default function ProjectSelector() {
    // perform redirect to project selection page if no project param is provided
    const project = useRouteParam('project', '/projects');
    // TODO (P2+) this could probably be pulled from the useProjects call instead of fetched
    // separately
    const { project: projectDetails, error: projectError } = useProject(project);

    const { projects, error, isValidating, mutate: refetchProjects } = useProjects();

    const otherProjectsList = projects && projects.filter(p => p.slug !== project);
    const otherProjects = otherProjectsList?.length ? otherProjectsList : null;
    return (
        <div className='selectorWrapper'>
            <Dropdown>
                <Dropdown.Toggle as={CustomToggle}>
                    <span className='toggleText'>{projectDetails ? projectDetails.name : <Placeholder animation='glow'><Placeholder size='sm' style={{ borderRadius: '0.5em', width: '10rem' }} /></Placeholder>}</span>
                    {projectDetails?.tutorial && <span className='tutorialBadge'><TutorialBadge /></span>}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                    {otherProjects && otherProjects.map(p => <Dropdown.Item as='div' onClick={() => mixpanel.track('DC Switch Project')} key={p.slug} eventKey={p.slug}><ProjectLink project={p} /></Dropdown.Item>)}
                    <Dropdown.Item as='div' style={{ color: 'var(--color-primary)' }} eventKey={'new'}><Link href='pick-project'><a><FontAwesomeIcon icon={faPlusCircle} style={{ marginRight: '0.5rem' }} />Create new project</a></Link></Dropdown.Item>
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
                .selectorWrapper a{
                    text-decoration: none;
                }
                .selectorWrapper a:hover{
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
