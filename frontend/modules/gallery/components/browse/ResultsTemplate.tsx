import Image from 'next/image';
import { useRouter } from 'next/router';

import { FeatherIcon } from '@/components/lib/FeatherIcon';
import { Flex } from '@/components/lib/Flex';
import PlaceholderImage from '@/public/images/gallery/placeholder.png';
import { styled } from '@/styles/stitches';
import { StableId } from '@/utils/stable-ids';

const TemplateTitle = styled(Flex, {
  marginBottom: '1.25rem',
});

const TemplateGradient = styled('div', {
  width: '100%',
  height: '100%',
  position: 'absolute',
  background: 'radial-gradient(85.56% 284.74% at 85.56% 25.68%, rgba(0, 0, 0, 0.5) 0%, rgba(0, 0, 0, 0) 100%)',
  opacity: 0,
  transition: 'opacity var(--transition-speed)',
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
  transition: 'opacity var(--transition-speed)',
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

// const TemplateShared = styled(FeatherIcon, {
//   transform: 'rotate(-90deg)',
// });

const ResultsTemplate = ({ template }) => {
  const router = useRouter();
  const onClick = () => router.push(`/gallery/${template.attributes.nameSlug}`);

  return (
    <Template data-stable-id={StableId.GALLERY_VIEW_SOURCE} onClick={onClick}>
      <TemplateImage>
        <Image layout="fill" src={PlaceholderImage} alt="" />
        <TemplateGradient />
        <TemplateGradientIcon align="center" justify="center">
          <FeatherIcon icon="maximize-2" color="ctaPrimaryText" size="s" />
        </TemplateGradientIcon>
      </TemplateImage>

      <TemplateTitle>{template.attributes.name}</TemplateTitle>
      {/* <Flex align="center">
        <TemplateShared icon="share-2" color="text3" size="s" />
        <Text color="text3">28.4k</Text>
        <FeatherIcon icon="heart" color="text3" size="s" />
        <Text color="text3">3.4k</Text>
      </Flex> */}
    </Template>
  );
};

export default ResultsTemplate;
