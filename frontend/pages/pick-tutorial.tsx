import { useRouter } from 'next/router';

import { Container } from '@/components/lib/Container';
import { Flex } from '@/components/lib/Flex';
import { H1 } from '@/components/lib/Heading';
import { P } from '@/components/lib/Paragraph';
import { ProjectCard } from '@/components/ProjectCard';
import { useSimpleLogoutLayout } from '@/hooks/layouts';
import type { NextPageWithLayout } from '@/utils/types';

enum Tutorial {
  NftMarket = 'NFT_MARKET',
  Crossword = 'CROSSWORD',
}

// Not including a path attribute will grey-out the tile and it will not be clickable.
const projects = [
  {
    id: 'nft-market',
    tutorial: Tutorial.NftMarket,
    title: 'NFT Market',
    path: '/new-nft-tutorial',
    description:
      'Start by minting an NFT using a pre-deployed contract, then build up to a fully-fledged NFT marketplace.',
  },
  {
    id: 'crossword',
    tutorial: Tutorial.Crossword,
    title: 'Crossword',
    description: 'Learn about access keys by building a crossword puzzle that pays out the daily winner.',
  },
];

const PickTutorial: NextPageWithLayout = () => {
  const router = useRouter();

  return (
    <Container size="m">
      <Flex stack gap="l">
        <H1>Select Tutorial</H1>

        <P>Choose from a variety of interactive tutorials. Each one ends with a production-ready project.</P>

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
