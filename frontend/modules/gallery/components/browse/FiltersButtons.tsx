import { Button } from '@/components/lib/Button';
import { Flex } from '@/components/lib/Flex';
import { styled } from '@/styles/stitches';
import { StableId } from '@/utils/stable-ids';

import type { FilterButtonsProps, Options } from './types';

const FilterSection = styled(Flex, {
  borderBottom: '1px solid #313538',
  marginBottom: '1.5rem',
  paddingBottom: '1.5rem',
});

const FiltersButtons = ({ title, options }: FilterButtonsProps) => {
  return (
    <FilterSection stack>
      {title}
      <Flex wrap>
        {options.map(({ option }: Options) => (
          <Button key={option} size="s" color="neutral" stableId={StableId.GALLERY_FILTER_TOOLS}>
            {option}
          </Button>
        ))}
      </Flex>
    </FilterSection>
  );
};

export default FiltersButtons;
