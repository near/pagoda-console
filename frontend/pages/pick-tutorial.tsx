import { useRouter } from 'next/router';

import ProjectCard from '@/components/ProjectCard';
import { useDashboardLayout } from '@/hooks/layouts';
import type { NextPageWithLayout } from '@/utils/types';

enum Tutorial {
  NftMarket = 'NFT_MARKET',
  Crossword = 'CROSSWORD',
}

// Not including a path attribute will grey-out the tile and it will not be clickable.
const projects = [
  {
    tutorial: Tutorial.NftMarket,
    title: 'NFT Market',
    path: '/new-nft-tutorial',
    description:
      'Start by minting an NFT using a pre-deployed contract, then build up to a fully-fledged NFT marketplace.',
  },
  {
    tutorial: Tutorial.Crossword,
    title: 'Crossword',
    description: 'Learn about access keys by building a crossword puzzle that pays out the daily winner.',
  },
];

const PickTutorial: NextPageWithLayout = () => {
  const router = useRouter();

  return (
    <div className="newProjectContainer">
      <h1 className="pageTitle">Select Tutorial</h1>
      <div className="calloutText">
        {/** // TODO once we have the ability to eject a tutorial, add this text in */}
        {/* Choose from a variety of interactive tutorials. Each one ends with a production-ready project. */}
      </div>
      <div className="cardsContainer">
        {projects.map((project, idx) => (
          <div key={idx}>
            <ProjectCard
              path={project.path}
              title={project.title}
              description={project.description}
              color="orange"
              onClick={() => project.path && router.push(project.path)}
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

PickTutorial.getLayout = useDashboardLayout;

export default PickTutorial;
