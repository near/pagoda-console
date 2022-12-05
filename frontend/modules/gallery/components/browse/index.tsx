import { Container } from '@/components/lib/Container';
import { styled } from '@/styles/stitches';

import Filters from './Filters';
import Results from './Results';

const CustomContainer = styled(Container, {
  marginBottom: '12.5rem',
  display: 'grid',
  gridTemplateColumns: '1fr 3fr',
  columnGap: '2.5rem',
});

const Browse = () => {
  return (
    <CustomContainer size="l">
      <Filters />
      <Results />
    </CustomContainer>
  );
};

export default Browse;
