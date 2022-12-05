import { Checkbox } from '@/components/lib/Checkbox';
import { Flex } from '@/components/lib/Flex';
import { Text } from '@/components/lib/Text';
import { styled } from '@/styles/stitches';

import type { FilterButtonsProps, Options } from './types';

const FilterSection = styled(Flex, {
  borderBottom: '1px solid #313538',
  marginBottom: '1.5rem',
  paddingBottom: '1.5rem',
});

const FiltersCheckboxes = ({ title, options, name }: FilterButtonsProps) => {
  return (
    <FilterSection stack>
      {title}
      <Flex stack>
        {options.map(({ option, value }: Options) => (
          <Checkbox key={option} value={value} name={name}>
            <Text color="text3">{option}</Text>
          </Checkbox>
        ))}
      </Flex>
    </FilterSection>
  );
};

export default FiltersCheckboxes;
