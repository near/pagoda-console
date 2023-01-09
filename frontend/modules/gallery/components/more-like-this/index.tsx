import { useRouter } from 'next/router';

import { Container } from '@/components/lib/Container';
import { Flex } from '@/components/lib/Flex';
import { Text } from '@/components/lib/Text';
import { useGalleryStore } from '@/stores/gallery';
import { selectMoreLikeThis } from '@/stores/gallery/gallery';
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

  '@tablet': {
    gridTemplateColumns: '1fr 1fr',
  },
  '@mobile': {
    gridTemplateColumns: '1fr',
  },
});

const SeeAllTemplate = styled('span', {
  color: 'var(--color-primary)',
  cursor: 'pointer',
});

const MoreLikeThis = () => {
  const router = useRouter();
  const moreLikeThis = useGalleryStore(selectMoreLikeThis);
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
        {moreLikeThis.map((template, i) => (
          <ResultsTemplate key={i} template={template} />
        ))}
      </Templates>
    </Container>
  );
};

export default MoreLikeThis;
