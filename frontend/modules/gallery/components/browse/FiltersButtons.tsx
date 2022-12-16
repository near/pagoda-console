import { Checkbox } from '@/components/lib/Checkbox';
import { Flex } from '@/components/lib/Flex';
import { Text } from '@/components/lib/Text';
import { useGalleryStore } from '@/stores/gallery';

import type { FilterButtonsProps } from './types';

const FiltersButtons = ({ title, options, name }: FilterButtonsProps) => {
  const switchFilter = useGalleryStore((state) => state.switchFilter);

  return (
    <Flex stack>
      {title}
      <Flex stack>
        {options?.map(({ option, value, checked, loader }) => (
          <Checkbox
            checked={!!checked}
            loader={loader}
            key={option}
            value={value}
            name={name}
            onChange={() => switchFilter(value, name)}
          >
            <Text color="text2">{option}</Text>
          </Checkbox>
        ))}
      </Flex>
    </Flex>
  );
};

export default FiltersButtons;
