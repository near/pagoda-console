import { useRouter } from 'next/router';

import { Box } from '@/components/lib/Box';
import { Container } from '@/components/lib/Container';
import { Flex } from '@/components/lib/Flex';
import Line from '@/components/lib/Line';
import { Text } from '@/components/lib/Text';
import { useGalleryLayout } from '@/hooks/layouts';
import MoreLikeThis from '@/modules/gallery/components/more-like-this';
import TemplateDetails from '@/modules/gallery/components/template';
import IconArrowLeft from '@/public/images/gallery/arrow-left.svg';
import { styled } from '@/styles/stitches';
import type { NextPageWithLayout } from '@/utils/types';

import Banner from './Banner';

const BackToTemplatesLink = styled(Flex, {
  marginBottom: '2rem',

  '& p': {
    cursor: 'pointer',

    '&:hover': {
      textDecoration: 'underline',
    },
  },
});

const CustomBox = styled(Box, {
  paddingTop: '110px',
  background:
    'url(/images/gallery/curve-three.svg) no-repeat right top, url(/images/gallery/curve-four.svg) no-repeat right top',
});

const ViewGallery: NextPageWithLayout = () => {
  const router = useRouter();

  const backToTemplates = () => router.push(`/gallery`);

  return (
    <CustomBox>
      <Container size="ml">
        <BackToTemplatesLink wrap justify="start" align="center">
          <IconArrowLeft />
          <Text color="text3" onClick={backToTemplates}>
            Back to Templates
          </Text>
        </BackToTemplatesLink>
        <TemplateDetails />
      </Container>
      <Line />
      <MoreLikeThis />
      <Banner />
    </CustomBox>
  );
};

ViewGallery.getLayout = useGalleryLayout;

export default ViewGallery;
