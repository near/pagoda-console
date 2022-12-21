import Image from 'next/image';

import { Box } from '@/components/lib/Box';
import { Button } from '@/components/lib/Button';
import { FeatherIcon } from '@/components/lib/FeatherIcon';
import { useGalleryStore } from '@/stores/gallery';
import { selectTemplateAttributes } from '@/stores/gallery/gallery';
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
  const { heroUrl } = useGalleryStore(selectTemplateAttributes);

  return (
    <RunExampleImage>
      <Image layout="fill" src={heroUrl} alt="" />
      <Button stableId={StableId.GALLERY_RUN_EXAMPLE}>
        <FeatherIcon icon="play" size="s" />
        Run Example
      </Button>
    </RunExampleImage>
  );
};

export default RunExample;
