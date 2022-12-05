import { useRouter } from 'next/router';

import { Container } from '@/components/lib/Container';
import { Flex } from '@/components/lib/Flex';
import { Text } from '@/components/lib/Text';
import { styled } from '@/styles/stitches';

import ResultsTemplate from '../browse/ResultsTemplate';

const ResultsTop = styled(Flex, {
  paddingBottom: '3rem',
});

const Templates = styled('div', {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr 1fr 1fr',
  columnGap: '2.5rem',
  rowGap: '3.75rem',
});

const SeeAllTemplate = styled('span', {
  color: 'var(--color-primary)',
  cursor: 'pointer',
});

const MoreLikeThis = () => {
  const templates = [1, 2, 3, 4];
  const router = useRouter();

  const seeAllTemplates = () => router.push('/gallery');

  return (
    <Container size="l">
      <ResultsTop align="end">
        <Flex>
          <Text size="h3" family="sprint">
            More Like This
          </Text>
        </Flex>
        <Flex justify="end">
          <SeeAllTemplate onClick={seeAllTemplates}>See All Templates</SeeAllTemplate>
        </Flex>
      </ResultsTop>
      <Templates>
        {templates.map((t) => (
          <ResultsTemplate key={t} />
        ))}
      </Templates>
    </Container>
  );
};

export default MoreLikeThis;
