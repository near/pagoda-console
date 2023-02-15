import type { GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import type { ParsedUrlQuery } from 'querystring';
import { useEffect } from 'react';

import { Box } from '@/components/lib/Box';
import { Container } from '@/components/lib/Container';
import { FeatherIcon } from '@/components/lib/FeatherIcon';
import { Flex } from '@/components/lib/Flex';
import { HR } from '@/components/lib/HorizontalRule';
import { Section } from '@/components/lib/Section';
import { Text } from '@/components/lib/Text';
import { useGalleryLayout } from '@/hooks/layouts';
import MoreLikeThis from '@/modules/gallery/components/more-like-this';
import TemplateDetails from '@/modules/gallery/components/template';
import { useGalleryStore } from '@/stores/gallery';
import type { Template, Templates } from '@/stores/gallery/gallery';
import { styled } from '@/styles/stitches';
import { fetchFromCMS } from '@/utils/cms';
import { StableId } from '@/utils/stable-ids';

import Banner from './Banner';

const BackToTemplatesLink = styled(Flex, {
  marginTop: '4rem',
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

interface IParams extends ParsedUrlQuery {
  slug: string;
}

export const getStaticProps: GetStaticProps = async (context) => {
  const { slug } = context.params as IParams;

  return {
    props: {
      template: (
        await fetchFromCMS({
          url: `/templates?filters[nameSlug][$eqi]=${slug}&populate[0]=tools&populate[1]=categories`,
        })
      )[0],
      moreLikeThis: await fetchFromCMS({ url: '/templates?sort[0]=createdAt&pagination[limit]=4' }),
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
  };
};

export const getStaticPaths = async () => ({
  paths: (await fetchFromCMS({ url: '/templates' })).map((template) => ({
    params: {
      slug: template.attributes.nameSlug,
    },
  })),
  fallback: false,
});

interface ViewGalleryProps {
  template: Template;
  moreLikeThis: Templates;
}

const ViewGallery = ({ template, moreLikeThis }: ViewGalleryProps) => {
  const router = useRouter();

  const setTemplate = useGalleryStore((store) => store.setTemplate);
  const setMoreLikeThis = useGalleryStore((store) => store.setMoreLikeThis);

  useEffect(() => {
    setTemplate(template);
    setMoreLikeThis(moreLikeThis);
  }, [moreLikeThis, setMoreLikeThis, setTemplate, template]);

  const backToTemplates = () => router.push(`/gallery`);

  return (
    <CustomBox>
      <Section background="none">
        <Container size="ml">
          <BackToTemplatesLink wrap justify="start" align="center">
            <FeatherIcon icon="arrow-left" color="text3" size="s" />
            <Text color="text3" onClick={backToTemplates} data-stable-id={StableId.GALLERY_BACK_TO_TEMPLATES}>
              Back to Templates
            </Text>
          </BackToTemplatesLink>
          <TemplateDetails />
        </Container>
        <HR color="border2" margin="xl" />
        <MoreLikeThis />
        <Banner />
      </Section>
    </CustomBox>
  );
};

ViewGallery.getLayout = useGalleryLayout;

export default ViewGallery;
