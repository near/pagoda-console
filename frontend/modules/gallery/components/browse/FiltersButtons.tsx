import { Button } from '@/components/lib/Button';
import { Flex } from '@/components/lib/Flex';
import { StableId } from '@/utils/stable-ids';

import type { FilterButtonsProps, Options } from './types';

const FiltersButtons = ({ title, options }: FilterButtonsProps) => {
  return (
    <Flex stack>
      {title}
      <Flex wrap>
        {options.map(({ option }: Options) => (
          <Button key={option} size="s" color="neutral" stableId={StableId.GALLERY_FILTER_TOOLS}>
            {option}
          </Button>
        ))}
      </Flex>
    </Flex>
  );
};

export default FiltersButtons;
