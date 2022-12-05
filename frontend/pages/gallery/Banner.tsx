import Image from 'next/image';

import { Box } from '@/components/lib/Box';
import { Button } from '@/components/lib/Button';
import { Container } from '@/components/lib/Container';
import { Flex } from '@/components/lib/Flex';
import { Text } from '@/components/lib/Text';
import IconArrowRightTop from '@/public/images/gallery/arrow-right-top.svg';
import ImageBanner from '@/public/images/gallery/banner.png';
import { styled } from '@/styles/stitches';
import { StableId } from '@/utils/stable-ids';

const CustomDiv = styled('div', {
  height: '26.625rem',
  backgroundColor: '#BABACB',
  margin: '7.5rem 0 12.5rem',
});

const BannerText = styled(Flex, {
  padding: '5rem 0 0 6.25rem',
  width: '45%',

  [`& ${Text}`]: {
    color: '#151718',
    marginBottom: '1rem',
  },
});

const CustomBox = styled(Box, {
  position: 'absolute',
  top: '10rem',
  right: 0,
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
            <IconArrowRightTop />
          </Button>
        </BannerText>
        <CustomBox>
          <Image src={ImageBanner} alt="" />
        </CustomBox>
      </CustomContainer>
    </CustomDiv>
  );
};

export default Banner;
