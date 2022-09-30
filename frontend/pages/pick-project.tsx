import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

import { Container } from '@/components/lib/Container';
import { FeatherIcon } from '@/components/lib/FeatherIcon';
import { Flex } from '@/components/lib/Flex';
import { H1 } from '@/components/lib/Heading';
import { Text } from '@/components/lib/Text';
import { TextLink } from '@/components/lib/TextLink';
import { useSimpleLogoutLayout } from '@/hooks/layouts';
import { useRouteParam } from '@/hooks/route';
import { ProjectCard } from '@/modules/core/components/ProjectCard';
import type { NextPageWithLayout } from '@/utils/types';

interface Project {
  id: string;
  title: string;
  path: string;
  description: string;
  icon: string;
}

const projects: Project[] = [
  {
    id: 'blank',
    title: 'Blank',
    path: '/new-project',
    description: 'A blank project with mainnet and testnet API keys.',
    icon: 'plus-circle',
  },
  {
    id: 'examples',
    title: 'Examples',
    path: '/pick-project-template',
    description: 'Explore an example project and contract template.',
    icon: 'grid',
  },
  {
    id: 'tutorial',
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
    <Container size="l">
      <Flex stack gap="xl">
        <Flex stack>
          {!isOnboarding && (
            <Link href="/projects" passHref>
              <TextLink>
                <FeatherIcon icon="arrow-left" /> Projects
              </TextLink>
            </Link>
          )}

          <H1>New Project</H1>

          {isOnboarding ? (
            <Text css={{ maxWidth: '600px', marginBottom: 'var(--space-l)' }}>One last thing! Hello, world.</Text>
          ) : (
            <Text>Hello World.</Text>
          )}
        </Flex>

        <Flex>
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              id={project.id}
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
