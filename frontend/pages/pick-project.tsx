import { useRouter } from 'next/router';
import { useEffect } from 'react';

import { Container } from '@/components/lib/Container';
import { Flex } from '@/components/lib/Flex';
import { H1 } from '@/components/lib/Heading';
import { P } from '@/components/lib/Paragraph';
import { ProjectCard } from '@/components/ProjectCard';
import { useSimpleLogoutLayout } from '@/hooks/layouts';
import { useRouteParam } from '@/hooks/route';
import type { NextPageWithLayout } from '@/utils/types';

interface Project {
  title: string;
  path: string;
  description: string;
  icon: string;
}

const projects: Project[] = [
  {
    title: 'Blank',
    path: '/new-project',
    description: 'A blank project with mainnet and testnet API keys.',
    icon: 'plus-circle',
  },
  {
    title: 'Tutorial',
    path: '/pick-tutorial',
    description: 'Choose from a variety of interactive tutorials.',
    icon: 'book',
  },
];

const PickProject: NextPageWithLayout = () => {
  const router = useRouter();

  useEffect(() => {
    projects.forEach((p) => router.prefetch(p.path));
  }, [router]);

  const isOnboarding = useRouteParam('onboarding');

  return (
    <Container size="m">
      <Flex stack gap="l">
        <H1>New Project</H1>

        {isOnboarding ? (
          <P>
            One last thing! Before we let you loose on the Developer Console, you’ll need to create a blank project or
            get some guidance with a tutorial. Projects contain API keys and any smart contracts you wish to track.
          </P>
        ) : (
          <P>Start with a blank project or get some guidance with a tutorial.</P>
        )}

        <Flex>
          {projects.map((project, idx) => (
            <ProjectCard
              key={idx}
              title={project.title}
              description={project.description}
              icon={project.icon}
              onClick={() => router.push(project.path)}
            />
          ))}
        </Flex>
      </Flex>
    </Container>
  );
};

PickProject.getLayout = useSimpleLogoutLayout;

export default PickProject;
