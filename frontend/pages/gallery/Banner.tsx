import Image from 'next/image';

import { Box } from '@/components/lib/Box';
import { Button } from '@/components/lib/Button';
import { Container } from '@/components/lib/Container';
import { FeatherIcon } from '@/components/lib/FeatherIcon';
import { Flex } from '@/components/lib/Flex';
import { Text } from '@/components/lib/Text';
import ImageBanner from '@/public/images/gallery/banner.png';
import { styled } from '@/styles/stitches';
import { StableId } from '@/utils/stable-ids';

const CustomDiv = styled('div', {
  height: '26.625rem',
  backgroundColor: '#BABACB',
  margin: '7.5rem 0 12.5rem',

  '@laptop': {
    height: '22rem',
  },
  '@tablet': {
    height: '20.5rem',
  },
  '@smallTablet': {
    height: '29rem',
  },
  '@mobile': {
    height: '27rem',
  },
});

const BannerText = styled(Flex, {
  padding: '5rem 6.25rem 0',
  width: '35rem',

  '@laptop': {
    padding: '3.75rem 5rem 0',
    width: '100%',
  },
  '@tablet': {
    padding: '1.75rem 2rem 0',
    width: '100%',
  },

  [`& ${Text}`]: {
    color: '#151718',
    marginBottom: '1rem',
  },
});

const CustomBox = styled(Box, {
  position: 'absolute',
  top: '10rem',
  right: 0,
  width: '731px',
  height: '380px',

  '@laptop': {
    top: '6rem',
    width: '620px',
  },
  '@tablet': {
    width: '450px',
  },
  '@smallTablet': {
    top: '14rem',
    width: '100%',
  },
  '@mobile': {
    top: '10rem',
    width: '100%',
  },
});

const CustomContainer = styled(Container, {
  position: 'relative',
});

const Banner = () => {
  return (
    <CustomDiv>
      <CustomContainer size="l">
        <BannerText stack>
          <Text size="h1" family="sprint">
            Don&apos;t see what you&apos;re looking for?
          </Text>
          <Text>We&apos;re always open to suggestions from our community.</Text>
          <Button color="input" stableId={StableId.GALLERY_REQUEST_A_TEMPLATE}>
            Request a Template
            <FeatherIcon icon="arrow-up-right" size="s" />
          </Button>
        </BannerText>
        <CustomBox>
          <Image layout="fill" objectFit="contain" src={ImageBanner} alt="" />
        </CustomBox>
      </CustomContainer>
    </CustomDiv>
  );
};

export default Banner;
