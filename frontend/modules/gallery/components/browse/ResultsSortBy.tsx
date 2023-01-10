import * as DropdownMenu from '@/components/lib/DropdownMenu';
import { StableId } from '@/utils/stable-ids';

const ResultsSortBy = () => {
  const options = [
    {
      value: 'Option 1',
    },
    {
      value: 'Option 2',
    },
    {
      value: 'Option 3',
    },
  ];

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Button size="s" stableId={StableId.GALLERY_SORT_BY_DROPDOWN}>
        Sort By
      </DropdownMenu.Button>
      <DropdownMenu.Content>
        {options.map(({ value }) => (
          <DropdownMenu.Item key={value}>{value}</DropdownMenu.Item>
        ))}
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
};

export default ResultsSortBy;
