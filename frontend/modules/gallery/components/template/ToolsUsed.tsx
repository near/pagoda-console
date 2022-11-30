import { Button } from '@/components/lib/Button';
import { Flex } from '@/components/lib/Flex';
import { styled } from '@/styles/stitches';
import { StableId } from '@/utils/stable-ids';

import type { Options } from '../browse/types';

const FilterSection = styled(Flex, {
  borderBottom: '1px solid #313538',
  marginBottom: '24px',
  paddingBottom: '24px',
});

const ToolsUsed = () => {
  const toolsUsedOptions: Array<Options> = [
    {
      option: 'NEAR-API-JS',
      value: '',
    },
    {
      option: 'Pagoda Enhanced API',
      value: '',
    },
    {
      option: 'NEAR-JS-SDK',
      value: '',
    },
    {
      option: 'Wallet Selector',
      value: '',
    },
    {
      option: 'NEP-141',
      value: '',
    },
  ];

  return (
    <FilterSection stack>
      Tools Used
      <Flex wrap>
        {toolsUsedOptions.map(({ option }) => (
          <Button key={option} size="s" color="neutral" stableId={StableId.GALLERY_FILTER_TOOLS}>
            {option}
          </Button>
        ))}
      </Flex>
    </FilterSection>
  );
};

export default ToolsUsed;
