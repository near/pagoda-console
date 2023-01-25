import Image from 'next/image';

import { Box } from '@/components/lib/Box';
import { useGalleryStore } from '@/stores/gallery';
import { selectTemplateAttributes } from '@/stores/gallery/gallery';
import { styled } from '@/styles/stitches';

const RunExampleImage = styled(Box, {
  width: '100%',
  height: '23.875rem',
  position: 'relative',
  overflow: 'hidden',
  borderTopLeftRadius: '2.5rem',
  margin: '3.75rem 0',

  '@tablet': {
    height: '24rem',
  },
  '@smallTablet': {
    height: '18rem',
  },
  '@mobile': {
    height: '14rem',
  },

  '& button': {
    position: 'absolute',
    top: '1.5rem',
    right: '1.5rem',
  },
});

const RunExample = () => {
  const { heroUrl } = useGalleryStore(selectTemplateAttributes);

  return heroUrl ? (
    <RunExampleImage>
      <Image layout="fill" src={heroUrl} alt="" />
      {/* <Button stableId={StableId.GALLERY_RUN_EXAMPLE}>
        <FeatherIcon icon="play" size="s" />
        Run Example
      </Button> */}
    </RunExampleImage>
  ) : null;
};

export default RunExample;
