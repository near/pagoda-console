import { Button } from '@/components/lib/Button';
import { FeatherIcon } from '@/components/lib/FeatherIcon';
import { Flex } from '@/components/lib/Flex';
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

const IconShareCustom = styled(FeatherIcon, {
  transform: 'rotate(-45deg)',
});

const TemplateArchitecture = () => {
  return (
    <FilterSection stack>
      Share
      <ShareButtons>
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
    </FilterSection>
  );
};

export default TemplateArchitecture;
