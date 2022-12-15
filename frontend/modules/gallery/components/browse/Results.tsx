import { Box } from '@/components/lib/Box';
import { Flex } from '@/components/lib/Flex';
import { Text } from '@/components/lib/Text';
import { useGalleryStore } from '@/stores/gallery';
import { selectNumberOfResults, selectTemplatesFiltered } from '@/stores/gallery/gallery';
import { styled } from '@/styles/stitches';

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
});

const ResetLink = styled('span', {
  color: 'var(--color-primary)',
  cursor: 'pointer',
});

const Results = () => {
  const templates = useGalleryStore(selectTemplatesFiltered);
  const numberOfResults = useGalleryStore(selectNumberOfResults);
  const resetFilters = useGalleryStore((state) => state.resetFilters);

  return (
    <Box>
      <ResultsTop align="center">
        <Flex>
          <Text color="text2">{numberOfResults} Results</Text>•<ResetLink onClick={resetFilters}>Reset</ResetLink>
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
