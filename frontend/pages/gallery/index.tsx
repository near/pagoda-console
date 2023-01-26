import type { GetStaticProps } from 'next';
import { useEffect } from 'react';

import { Box } from '@/components/lib/Box';
import { Container } from '@/components/lib/Container';
import { Flex } from '@/components/lib/Flex';
import { HR } from '@/components/lib/HorizontalRule';
import { Section } from '@/components/lib/Section';
import { Text } from '@/components/lib/Text';
import { useGalleryLayout } from '@/hooks/layouts';
import Browse from '@/modules/gallery/components/browse';
import IconOne from '@/public/images/gallery/icon-1.svg';
import IconTwo from '@/public/images/gallery/icon-2.svg';
import IconThree from '@/public/images/gallery/icon-3.svg';
import { useGalleryStore } from '@/stores/gallery';
import type { FiltersDB, Templates } from '@/stores/gallery/gallery';
import { styled } from '@/styles/stitches';
import { fetchFromCMS } from '@/utils/cms';

import Step from './Step';

const Header = styled(Flex, {
  background: 'url(/images/gallery/build.png) no-repeat right center',
  height: '31.25rem',

  '@tablet': {
    backgroundSize: '14rem',
    height: '20rem',
    paddingBottom: 'var(--space-l)',
  },
  '@mobile': {
    backgroundSize: '14rem',
    height: '20rem',
    backgroundPositionY: '0rem',
    backgroundPositionX: 'center',
    paddingTop: '20rem',
  },

  [`& ${Text}`]: {
    paddingBottom: '1.875rem',
    width: '33.75rem',

    '@tablet': {
      width: '19rem',
    },
    '@mobile': {
      width: '100%',
    },
  },
});

const CustomBox = styled(Box, {
  paddingTop: '6.875rem',
  background:
    'url(/images/gallery/curve-one.svg) no-repeat left top, url(/images/gallery/curve-two.svg) no-repeat left top',
});

export const getStaticProps: GetStaticProps = async (_) => ({
  props: {
    templates: await fetchFromCMS({ url: '/templates?populate[0]=tools&populate[1]=categories' }),
    filters: {
      categories: await fetchFromCMS({ url: '/categories' }),
      tools: await fetchFromCMS({ url: '/tools' }),
      // --- TODO: to be switched when languages will be available
      // languages: await fetchFromCMS({ url: '/languages' }),
      languages: [
        {
          id: 1,
          attributes: { name: 'JavaScript' },
        },
        {
          id: 0,
          attributes: { name: 'Rust' },
        },
      ],
      // ---
    },
  },
});

interface GalleryProps {
  templates: Templates;
  filters: FiltersDB;
}

const Gallery = ({ templates, filters }: GalleryProps) => {
  const setFilters = useGalleryStore((store) => store.setFilters);
  const setTemplates = useGalleryStore((store) => store.setTemplates);

  useEffect(() => {
    setFilters(filters);
    setTemplates(templates);
  }, [filters, setFilters, setTemplates, templates]);

  return (
    <CustomBox>
      <Section background="none">
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
          <Flex
            stack="mobile"
            gap={{
              '@initial': 'xxl',
              '@mobile': 's',
              '@tablet': 'm',
            }}
          >
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
              text="Your contracts are auto-deployed to the NEAR testnet and IPFS (for templates with a UI)."
            />
          </Flex>
        </Container>
        <HR color="border2" margin="xl" />
        <Browse />
      </Section>
    </CustomBox>
  );
};

Gallery.getLayout = useGalleryLayout;

export default Gallery;
