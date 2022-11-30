import { Container } from '@/components/lib/Container';
import { styled } from '@/styles/stitches';

import Filters from './Filters';
import Results from './Results';

const CustomContainer = styled(Container, {
  marginBottom: '200px',
  display: 'grid',
  gridTemplateColumns: '1fr 3fr',
  columnGap: '40px',
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
