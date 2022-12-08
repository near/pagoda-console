import { Box } from '@/components/lib/Box';
import { Container } from '@/components/lib/Container';
import { Flex } from '@/components/lib/Flex';
import { HR } from '@/components/lib/HorizontalRule';
import { Text } from '@/components/lib/Text';
import { useGalleryLayout } from '@/hooks/layouts';
import Browse from '@/modules/gallery/components/browse';
import IconOne from '@/public/images/gallery/icon-1.svg';
import IconTwo from '@/public/images/gallery/icon-2.svg';
import IconThree from '@/public/images/gallery/icon-3.svg';
import { styled } from '@/styles/stitches';
import type { NextPageWithLayout } from '@/utils/types';

import Step from './Step';

const Header = styled(Flex, {
  background: 'url(/images/gallery/build.png) no-repeat right center',
  height: '31.25rem',

  [`& ${Text}`]: {
    paddingBottom: '1.875rem',
    width: '33.75rem',
  },
});

const CustomBox = styled(Box, {
  paddingTop: '6.875rem',
  background:
    'url(/images/gallery/curve-one.svg) no-repeat left top, url(/images/gallery/curve-two.svg) no-repeat left top',
});

const Gallery: NextPageWithLayout = () => {
  return (
    <CustomBox>
      <Container size="ml">
        <Header align="center">
          <Flex stack>
            <Text size="h1" family="sprint">
              Build fast, learn fast with templates.
            </Text>
            <Text color="text2">
              This is a subheading to tell the user more about what this page is and how it should be used.
            </Text>
          </Flex>
        </Header>
        <Flex gap="xxl">
          <Step
            icon={<IconOne />}
            header="Choose a Template"
            text="Browse Pagoda's library of audited contract templates to use as a foundation for your application."
          />
          <Step
            icon={<IconTwo />}
            header="Fork, Modify, & Iterate"
            text="Fork your chosen template and make it your own with little to no setup."
          />
          <Step
            icon={<IconThree />}
            header="Enjoy Automated Builds & Deploys"
            text="Your contracts are auto-deployed to the NEAR testnet and Github pages (for templates with a UI)."
          />
        </Flex>
      </Container>
      <HR color="border2" margin="xl" />
      <Browse />
    </CustomBox>
  );
};

Gallery.getLayout = useGalleryLayout;

export default Gallery;
