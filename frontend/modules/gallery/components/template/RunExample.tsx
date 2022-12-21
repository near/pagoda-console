import Image from 'next/image';

import { Box } from '@/components/lib/Box';
import { Button } from '@/components/lib/Button';
import { FeatherIcon } from '@/components/lib/FeatherIcon';
import ImagePlaceholder2 from '@/public/images/gallery/placeholder-2.png';
import { styled } from '@/styles/stitches';
import { StableId } from '@/utils/stable-ids';

const RunExampleImage = styled(Box, {
  width: '100%',
  height: '23.875rem',
  position: 'relative',
  overflow: 'hidden',
  borderTopLeftRadius: '2.5rem',
  margin: '3.75rem 0',

  '& button': {
    position: 'absolute',
    top: '1.5rem',
    right: '1.5rem',
  },
});

const RunExample = () => {
  return (
    <RunExampleImage>
      <Image layout="fill" src={ImagePlaceholder2} alt="" />
      <Button stableId={StableId.GALLERY_RUN_EXAMPLE}>
        <FeatherIcon icon="play" size="s" />
        Run Example
      </Button>
    </RunExampleImage>
  );
};

export default RunExample;
