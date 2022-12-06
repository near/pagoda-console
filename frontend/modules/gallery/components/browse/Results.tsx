import { Box } from '@/components/lib/Box';
import { Flex } from '@/components/lib/Flex';
import { Text } from '@/components/lib/Text';
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
  const templates = [1, 2, 3, 4, 5, 6, 7];

  return (
    <Box>
      <ResultsTop align="center">
        <Flex>
          <Text color="text2">12 Results</Text>•<ResetLink>Reset</ResetLink>
        </Flex>
        <Flex justify="end">
          <ResultsSortBy />
        </Flex>
      </ResultsTop>
      <Templates>
        {templates.map((t) => (
          <ResultsTemplate key={t} />
        ))}
      </Templates>
    </Box>
  );
};

export default Results;
