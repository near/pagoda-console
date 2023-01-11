import { FeatherIcon } from '@/components/lib/FeatherIcon';
import { Flex } from '@/components/lib/Flex';
import { styled } from '@/styles/stitches';

const Arrow = styled(Flex, {
  width: '6.25rem',
  position: 'relative',

});

const ArrowInCircle = () => (
  <Arrow>
    <Flex align="center" justify="center">
      <FeatherIcon size="m" icon="arrow-right-circle" color="text3" />
    </Flex>
  </Arrow>
);

export default ArrowInCircle;
