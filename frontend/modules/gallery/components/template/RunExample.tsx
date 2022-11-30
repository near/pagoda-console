import Image from 'next/image';

import { Box } from '@/components/lib/Box';
import { Button } from '@/components/lib/Button';
import ImagePlaceholder2 from '@/public/images/gallery/placeholder-2.png';
import IconPlay from '@/public/images/gallery/play.svg';
import { styled } from '@/styles/stitches';
import { StableId } from '@/utils/stable-ids';

const RunExampleImage = styled(Box, {
  width: '100%',
  height: '382px',
  position: 'relative',
  overflow: 'hidden',
  borderTopLeftRadius: '40px',
  margin: '60px 0',

  '& button': {
    position: 'absolute',
    top: '24px',
    right: '24px',
  },
});

const RunExample = () => {
  return (
    <RunExampleImage>
      <Image layout="fill" src={ImagePlaceholder2} alt="" />
      <Button stableId={StableId.GALLERY_RUN_EXAMPLE}>
        <IconPlay />
        Run Example
      </Button>
    </RunExampleImage>
  );
};

export default RunExample;
