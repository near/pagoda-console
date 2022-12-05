import { Button } from '@/components/lib/Button';
import { Flex } from '@/components/lib/Flex';
import IconFacebook from '@/public/images/gallery/facebook.svg';
import IconShare from '@/public/images/gallery/share.svg';
import IconTwitter from '@/public/images/gallery/twitter.svg';
import { styled } from '@/styles/stitches';
import { StableId } from '@/utils/stable-ids';

const FilterSection = styled(Flex, {
  borderBottom: '1px solid #313538',
  marginBottom: '1.5rem',
  paddingBottom: '1.5rem',
});

const ShareButtons = styled(Flex, {
  '& button': {
    width: '5rem',
  },

  '& span': {
    height: '100%',
  },
});

const IconShareCustom = styled(IconShare, {
  transform: 'rotate(-45deg)',
});

const TemplateArchitecture = () => {
  return (
    <FilterSection stack>
      Share
      <ShareButtons>
        <Button color="neutral" stableId={StableId.GALLERY_FILTER_TOOLS}>
          <IconShareCustom />
        </Button>
        <Button color="neutral" stableId={StableId.GALLERY_FILTER_TOOLS}>
          <IconTwitter />
        </Button>
        <Button color="neutral" stableId={StableId.GALLERY_FILTER_TOOLS}>
          <IconFacebook />
        </Button>
      </ShareButtons>
    </FilterSection>
  );
};

export default TemplateArchitecture;
