import { Checkbox } from '@/components/lib/Checkbox';
import { Flex } from '@/components/lib/Flex';
import { Text } from '@/components/lib/Text';

import type { FilterButtonsProps, Options } from './types';

const FiltersCheckboxes = ({ title, options, name }: FilterButtonsProps) => {
  return (
    <Flex stack>
      {title}
      <Flex stack>
        {options.map(({ option, value }: Options) => (
          <Checkbox key={option} value={value} name={name}>
            <Text color="text2">{option}</Text>
          </Checkbox>
        ))}
      </Flex>
    </Flex>
  );
};

export default FiltersCheckboxes;
