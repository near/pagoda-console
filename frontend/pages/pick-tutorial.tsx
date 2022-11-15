import { ProjectTutorial } from '@pc/database/clients/core';
import Link from 'next/link';
import { useRouter } from 'next/router';

import { Container } from '@/components/lib/Container';
import { FeatherIcon } from '@/components/lib/FeatherIcon';
import { Flex } from '@/components/lib/Flex';
import { H1 } from '@/components/lib/Heading';
import { Text } from '@/components/lib/Text';
import { TextLink } from '@/components/lib/TextLink';
import { useSimpleLogoutLayout } from '@/hooks/layouts';
import { ProjectCard } from '@/modules/core/components/ProjectCard';
import { StableId } from '@/utils/stable-ids';
import type { NextPageWithLayout } from '@/utils/types';

// Not including a path attribute will grey-out the tile and it will not be clickable.
const projects = [
  {
    id: 'nft-market',
    tutorial: ProjectTutorial.NFT_MARKET,
    title: 'NFT Market',
    path: '/new-nft-tutorial',
    description:
      'Start by minting an NFT using a pre-deployed contract, then build up to a fully-fledged NFT marketplace.',
  },
  {
    id: 'crossword',
    tutorial: ProjectTutorial.CROSSWORD,
    title: 'Crossword',
    description: 'Learn about access keys by building a crossword puzzle that pays out the daily winner.',
  },
];

const PickTutorial: NextPageWithLayout = () => {
  const router = useRouter();

  return (
    <Container size="m">
      <Flex stack gap="xl">
        <Flex stack>
          <Link href="/pick-project" passHref>
            <TextLink stableId={StableId.TUTORIAL_TYPE_BACK_TO_PROJECT_TYPE_LINK}>
              <FeatherIcon icon="arrow-left" /> Project Type
            </TextLink>
          </Link>
          <H1>Select Tutorial</H1>
          <Text>Choose from a variety of interactive tutorials. Each one ends with a production-ready project.</Text>
        </Flex>

        <Flex>
          {projects.map((project) => (
            <div key={project.id}>
              <ProjectCard
                id={project.id}
                isComingSoon={!project.path}
                title={project.title}
                description={project.description}
                onClick={() => project.path && router.push(project.path)}
              />
            </div>
          ))}
        </Flex>
      </Flex>
    </Container>
  );
};

PickTutorial.getLayout = useSimpleLogoutLayout;

export default PickTutorial;
