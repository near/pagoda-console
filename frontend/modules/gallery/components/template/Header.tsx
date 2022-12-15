import { Box } from '@/components/lib/Box';
import { Button, ButtonLink } from '@/components/lib/Button';
import { FeatherIcon } from '@/components/lib/FeatherIcon';
import { Flex } from '@/components/lib/Flex';
import { Text } from '@/components/lib/Text';
import LogoIconSvg from '@/public/images/brand/pagoda-icon.svg';
import { useGalleryStore } from '@/stores/gallery';
import { selectTemplateAttributes, selectTemplateTools } from '@/stores/gallery/gallery';
import { styled } from '@/styles/stitches';
import { StableId } from '@/utils/stable-ids';

const IconShare = styled(FeatherIcon, {
  transform: 'rotate(-90deg)',
});

const LogoCircle = styled(Flex, {
  width: '2.5rem',
  height: '2.5rem',
  border: '1px solid #9BA1A6',
  borderRadius: '100%',
  padding: '0.5rem',
});

const UseTemplateButton = styled(Button, {
  padding: '0 1.75rem',

  '& div': {
    height: '1.875rem',
    borderRight: '1px solid #55B467',
  },
});

const Header = () => {
  const { name, githubUrl } = useGalleryStore(selectTemplateAttributes);
  const { allUsed } = useGalleryStore(selectTemplateTools);

  return (
    <Flex>
      <Flex stack>
        <Text size="h3" family="sprint">
          {name}
        </Text>
        <Flex>
          {allUsed.map(({ name, id }) => (
            <Button key={id} size="s" color="input" stableId={StableId.GALLERY_TAGS}>
              {name}
            </Button>
          ))}
        </Flex>
        <Flex align="center">
          <LogoCircle align="center" justify="center">
            <LogoIconSvg />
          </LogoCircle>
          <Text color="text2">Pagoda</Text>
        </Flex>
      </Flex>
      <Flex stack autoWidth>
        <Flex justify="end">
          <UseTemplateButton stableId={StableId.GALLERY_USE_TEMPLATE}>
            <IconShare icon="share-2" size="s" />
            Use Template
            <Box />
            28.4 k
          </UseTemplateButton>
        </Flex>
        <Flex justify="end">
          <Button color="neutral" stableId={StableId.GALLERY_LIKE}>
            <FeatherIcon icon="heart" color="danger" size="s" />
            319
          </Button>
          <ButtonLink href={githubUrl} color="neutral" stableId={StableId.GALLERY_VIEW_SOURCE}>
            <FeatherIcon icon="github" size="s" />
            View Source
          </ButtonLink>
        </Flex>
      </Flex>
    </Flex>
  );
};

export default Header;
