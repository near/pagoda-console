import { Button } from '@/components/lib/Button';
import { Flex } from '@/components/lib/Flex';
import { StableId } from '@/utils/stable-ids';

const ToolsUsed = ({ tools }) => (
  <Flex stack>
    Tools Used
    <Flex wrap>
      {tools?.map(({ name, id }) => (
        <Button key={id} size="s" color="neutral" stableId={StableId.GALLERY_FILTER_TOOLS}>
          {name}
        </Button>
      ))}
    </Flex>
  </Flex>
);

export default ToolsUsed;
