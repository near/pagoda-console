import { useRouter } from 'next/router';
import { useEffect } from 'react';

import type { ProjectCardColor } from '@/components/ProjectCard';
import ProjectCard from '@/components/ProjectCard';
import { useDashboardLayout } from '@/hooks/layouts';
import { useRouteParam } from '@/hooks/route';
import type { NextPageWithLayout } from '@/utils/types';

interface Project {
  title: string;
  path: string;
  description: string;
  color: ProjectCardColor;
}

const projects: Project[] = [
  {
    title: 'Blank',
    path: '/new-project',
    description: 'A blank project with mainnet and testnet API keys.',
    color: 'green',
  },
  {
    title: 'Tutorial',
    path: '/pick-tutorial',
    description: 'Choose from a variety of interactive tutorials.',
    color: 'orange',
  },
];

const PickProject: NextPageWithLayout = () => {
  const router = useRouter();

  useEffect(() => {
    projects.forEach((p) => router.prefetch(p.path));
  }, [router]);

  const isOnboarding = useRouteParam('onboarding');

  return (
    <div className="newProjectContainer">
      <h1 className="pageTitle">New Project</h1>
      {isOnboarding && (
        <div className="calloutText">
          One last thing! Before we let you loose on the Developer Console, you’ll need to create a blank project or get
          some guidance with a tutorial. Projects contain API keys and any smart contracts you wish to track.
        </div>
      )}
      {!isOnboarding && (
        <div className="calloutText">Start with a blank project or get some guidance with a tutorial.</div>
      )}
      <div className="cardsContainer">
        {projects.map((project, idx) => (
          <div key={idx}>
            <ProjectCard
              path={project.path}
              title={project.title}
              description={project.description}
              color={project.color}
              onClick={() => router.push(project.path)}
            />
          </div>
        ))}
      </div>
      <style jsx>{`
        .pageTitle {
          margin-bottom: 1.25rem;
        }
        .calloutText {
          margin-bottom: 2.625rem;
        }
        .cardsContainer {
          display: flex;
          flex-direction: row;
          flex-wrap: wrap;
          column-gap: 1.5rem;
        }
      `}</style>
    </div>
  );
};

PickProject.getLayout = useDashboardLayout;

export default PickProject;
