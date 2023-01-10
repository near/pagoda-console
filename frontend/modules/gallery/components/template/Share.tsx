import { Button } from '@/components/lib/Button';
import { FeatherIcon } from '@/components/lib/FeatherIcon';
import { Flex } from '@/components/lib/Flex';
import { styled } from '@/styles/stitches';
import { StableId } from '@/utils/stable-ids';

const ShareButtons = styled(Flex, {
  '& button': {
    width: '5rem',
  },

  '& span': {
    height: '100%',
  },
});

const IconShareCustom = styled(FeatherIcon, {
  transform: 'rotate(-45deg)',
});

const TemplateArchitecture = () => (
  <Flex stack>
    Share
    <ShareButtons wrap>
      <Button color="neutral" stableId={StableId.GALLERY_FILTER_TOOLS}>
        <IconShareCustom icon="link-2" size="s" color="text2" />
      </Button>
      <Button color="neutral" stableId={StableId.GALLERY_FILTER_TOOLS}>
        <FeatherIcon icon="twitter" size="s" color="text2" />
      </Button>
      <Button color="neutral" stableId={StableId.GALLERY_FILTER_TOOLS}>
        <FeatherIcon icon="facebook" size="s" color="text2" />
      </Button>
    </ShareButtons>
  </Flex>
);

export default TemplateArchitecture;
