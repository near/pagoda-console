import { Container } from '@/components/lib/Container';
import { styled } from '@/styles/stitches';

// import Filters from './Filters';
import Results from './Results';

// const CustomContainer = styled(Container, {
//   marginBottom: '12.5rem',
//   display: 'grid',
//   gridTemplateColumns: '1fr 3fr',
//   columnGap: '2.5rem',

//   '@tablet': {
//     gridTemplateColumns: '1fr 3fr',
//     columnGap: '1.5rem',
//   },
//   '@smallTablet': {
//     gridTemplateColumns: '2fr 3fr',
//   },
//   '@mobile': {
//     gridTemplateColumns: '1fr 2fr',
//   },
// });

const CustomContainer = styled(Container, {
  marginBottom: '12.5rem',
  display: 'grid',
  gridTemplateColumns: '3fr',
  columnGap: '2.5rem',

  '@tablet': {
    gridTemplateColumns: '3fr',
    columnGap: '1.5rem',
  },
  '@smallTablet': {
    gridTemplateColumns: '3fr',
  },
  '@mobile': {
    gridTemplateColumns: '2fr',
  },
});

const Browse = () => {
  return (
    <CustomContainer size="l">
      {/* <Filters /> */}
      <Results />
    </CustomContainer>
  );
};

export default Browse;
