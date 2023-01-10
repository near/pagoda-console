import { Box } from '@/components/lib/Box';
import { Card } from '@/components/lib/Card';
import { Flex } from '@/components/lib/Flex';
import { H3 } from '@/components/lib/Heading';
import { List, ListItem } from '@/components/lib/List';
import { SvgIcon } from '@/components/lib/SvgIcon';
import { Text } from '@/components/lib/Text';
import TxList from '@/public/contracts/images/TxList.svg';
import { styled } from '@/styles/stitches';

const ListWrapper = styled(List, {
  [`& ${ListItem}`]: {
    color: 'var(--color-text-1)',

    '&::marker': {
      color: 'inherit',
    },
  },
});

const TextItalic = styled(Text, {
  fontStyle: 'italic',
});

const TxResultBanner = () => (
  <Card>
    <Flex>
      <Box>
        <SvgIcon size="xl" color="success" icon={TxList} />
      </Box>
      <Flex stack gap="l">
        <H3>Sending a Transaction</H3>
        <ListWrapper as="ol">
          <ListItem>Select Function</ListItem>
          <ListItem>Input function parameters</ListItem>
          <ListItem>Send transaction</ListItem>
        </ListWrapper>
        <TextItalic>The transaction execution and history will show up here</TextItalic>
      </Flex>
    </Flex>
  </Card>
);

export default TxResultBanner;
