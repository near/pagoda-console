import Image from 'next/image';
import { useRouter } from 'next/router';

import { Flex } from '@/components/lib/Flex';
import { Text } from '@/components/lib/Text';
import FullScreen from '@/public/images/gallery/full-screen.svg';
import Liked from '@/public/images/gallery/liked.svg';
import PlaceholderImage from '@/public/images/gallery/placeholder.png';
import Shared from '@/public/images/gallery/shared.svg';
import { styled } from '@/styles/stitches';

const TemplateTitle = styled(Flex, {
  marginBottom: '1.25rem',
});

const TemplateGradient = styled('div', {
  width: '100%',
  height: '100%',
  position: 'absolute',
  background: 'radial-gradient(85.56% 284.74% at 85.56% 25.68%, rgba(0, 0, 0, 0.5) 0%, rgba(0, 0, 0, 0) 100%)',
  opacity: 0,
});

const TemplateGradientIcon = styled(Flex, {
  width: '2.5rem',
  height: '2.5rem',
  position: 'absolute',
  top: '1rem',
  right: '1rem',
  background: '#fff',
  borderRadius: '100%',
  opacity: 0,
});

const Template = styled('div', {
  cursor: 'pointer',

  '&:hover': {
    [`& ${TemplateTitle}`]: {
      textDecoration: 'underline',
    },
    [`& ${TemplateGradient}`]: {
      opacity: 1,
    },
    [`& ${TemplateGradientIcon}`]: {
      opacity: 1,
    },
  },
});

const TemplateImage = styled('div', {
  width: '100%',
  height: '9.25rem',
  position: 'relative',
  overflow: 'hidden',
  marginBottom: '1.875rem',

  '& span': {
    borderTopLeftRadius: '2.5rem',
  },
});

const TemplateShared = styled(Shared, {
  transform: 'rotate(-90deg)',
});

const ResultsTemplate = () => {
  const router = useRouter();

  return (
    <Template onClick={() => router.push(`/gallery/example`)}>
      <TemplateImage>
        <Image layout="fill" src={PlaceholderImage} alt="" />
        <TemplateGradient />
        <TemplateGradientIcon align="center" justify="center">
          <FullScreen />
        </TemplateGradientIcon>
      </TemplateImage>

      <TemplateTitle>Loyalty Program with NEAR Fungible Tokens (FT)</TemplateTitle>
      <Flex align="center">
        <TemplateShared />
        <Text color="text3">28.4k</Text>
        <Liked />
        <Text color="text3">3.4k</Text>
      </Flex>
    </Template>
  );
};

export default ResultsTemplate;
