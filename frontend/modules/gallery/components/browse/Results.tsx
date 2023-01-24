import { Box } from '@/components/lib/Box';
import { Flex } from '@/components/lib/Flex';
import { Text } from '@/components/lib/Text';
import { useGalleryStore } from '@/stores/gallery';
import { selectDbLoader, selectNumberOfResults, selectTemplatesFiltered } from '@/stores/gallery/gallery';
import { keyframes, styled } from '@/styles/stitches';

import ResultsSortBy from './ResultsSortBy';
import ResultsTemplate from './ResultsTemplate';

const ResultsTop = styled(Flex, {
  paddingBottom: '2rem',
});

const Templates = styled('div', {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr 1fr',
  columnGap: '2.5rem',
  rowGap: '3.75rem',

  '@tablet': {
    gridTemplateColumns: '1fr 1fr',
  },
  '@smallTablet': {
    gridTemplateColumns: '1fr',
  },
});

const spinAnimation = keyframes({
  from: { transform: 'rotate(0deg)' },
  to: { transform: 'rotate(360deg)' },
});

const ResetLink = styled('span', {
  color: 'var(--color-primary)',
  cursor: 'pointer',
  position: 'relative',

  variants: {
    loader: {
      true: {
        [`& span`]: {
          opacity: 0,
        },

        '&:before': {
          opacity: 1,
        },
      },
      false: {
        [`& span`]: {
          opacity: 1,
        },

        '&:before': {
          opacity: 0,
        },
      },
    },
    default: {
      [`& span`]: {
        opacity: 1,
      },

      '&:before': {
        opacity: 0,
      },
    },
  },

  [`& span`]: {
    transition: 'opacity 0.2s',
  },

  '&:before': {
    transition: 'opacity 0.2s',
    content: '',
    display: 'block',
    width: '1.2em',
    height: '1.2em',
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    margin: '-0.6rem 0 0 0.8rem',
    borderRadius: '100%',
    border: '3px solid currentColor',
    borderTopColor: 'transparent',
    animation: `${spinAnimation} 700ms linear infinite`,
  },
});

const Results = () => {
  const templates = useGalleryStore(selectTemplatesFiltered);
  const numberOfResults = useGalleryStore(selectNumberOfResults);
  const resetFilters = useGalleryStore((state) => state.resetFilters);
  const dbLoader = useGalleryStore(selectDbLoader);

  return (
    <Box>
      <ResultsTop align="center">
        <Flex
          gap={{
            '@smallTablet': 's',
          }}
          align="center"
        >
          <Text color="text2">{numberOfResults} Results</Text>•
          <ResetLink loader={dbLoader} onClick={resetFilters}>
            <span>Reset</span>
          </ResetLink>
        </Flex>
        <Flex justify="end">
          <ResultsSortBy />
        </Flex>
      </ResultsTop>
      <Templates>
        {templates.map((template, i) => (
          <ResultsTemplate key={i} template={template} />
        ))}
      </Templates>
    </Box>
  );
};

export default Results;
