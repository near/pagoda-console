import { useRouter } from 'next/router';

import { Box } from '@/components/lib/Box';
import { Container } from '@/components/lib/Container';
import { FeatherIcon } from '@/components/lib/FeatherIcon';
import { Flex } from '@/components/lib/Flex';
import { HR } from '@/components/lib/HorizontalRule';
import { Text } from '@/components/lib/Text';
import { useGalleryLayout } from '@/hooks/layouts';
import MoreLikeThis from '@/modules/gallery/components/more-like-this';
import TemplateDetails from '@/modules/gallery/components/template';
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
  paddingTop: '6.875rem',
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
          <FeatherIcon icon="arrow-left" color="text3" size="s" />
          <Text color="text3" onClick={backToTemplates}>
            Back to Templates
          </Text>
        </BackToTemplatesLink>
        <TemplateDetails />
      </Container>
      <HR color="border2" margin="xl" />
      <MoreLikeThis />
      <Banner />
    </CustomBox>
  );
};

ViewGallery.getLayout = useGalleryLayout;

export default ViewGallery;
