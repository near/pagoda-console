import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

import { Container } from '@/components/lib/Container';
import { FeatherIcon } from '@/components/lib/FeatherIcon';
import { Flex } from '@/components/lib/Flex';
import { H1 } from '@/components/lib/Heading';
import { Section } from '@/components/lib/Section';
import { Text } from '@/components/lib/Text';
import { TextLink } from '@/components/lib/TextLink';
import { useSimpleLogoutLayout } from '@/hooks/layouts';
import { useRouteParam } from '@/hooks/route';
import { ProjectCard } from '@/modules/core/components/ProjectCard';
import { StableId } from '@/utils/stable-ids';
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
    <Section>
      <Container css={{ maxWidth: '56.5rem' }}>
        <Flex stack gap={{ '@initial': 'xl', '@tablet': 'l' }}>
          <Flex stack>
            {!isOnboarding && (
              <Link href="/projects" passHref>
                <TextLink stableId={StableId.PROJECT_TYPE_BACK_TO_PROJECTS_LINK}>
                  <FeatherIcon icon="arrow-left" /> Projects
                </TextLink>
              </Link>
            )}

            <H1>New Project</H1>

            {isOnboarding ? (
              <Text css={{ maxWidth: '600px', marginBottom: 'var(--space-l)' }}>
                One last thing! Before we let you loose on the Developer Console, you’ll need to create a blank project
                or get some guidance with a tutorial. Projects contain API keys and any smart contracts you wish to
                track.
              </Text>
            ) : (
              <Text>Start with a blank project or get some guidance with a tutorial.</Text>
            )}
          </Flex>

          <Flex wrap>
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
    </Section>
  );
};

PickProject.getLayout = useSimpleLogoutLayout;

export default PickProject;
