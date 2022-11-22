import { FeatherIcon } from '@/components/lib/FeatherIcon';
import { Flex } from '@/components/lib/Flex';
import { H1 } from '@/components/lib/Heading';
import { List, ListItem } from '@/components/lib/List';
import { Text } from '@/components/lib/Text';

export function ApisMarketing() {
  return (
    <Flex stack gap="l">
      <Flex align="center">
        <FeatherIcon icon="code" size="l" />
        <H1>APIs</H1>
      </Flex>

      <Text color="text1" size="h5">
        Sign in to unlock the power of Pagoda & NEAR APIs:
      </Text>

      <List>
        <ListItem>Manage RPC API keys.</ListItem>
        <ListItem>View analytics regarding RPC usage.</ListItem>
        <ListItem>Explore and interact with RPC documentation.</ListItem>
      </List>
    </Flex>
  );
}
