import { FeatherIcon } from '@/components/lib/FeatherIcon';
import { Flex } from '@/components/lib/Flex';
import { H1 } from '@/components/lib/Heading';
import { List, ListItem } from '@/components/lib/List';
import { Text } from '@/components/lib/Text';

export function ProjectsMarketing() {
  return (
    <Flex stack gap="l">
      <Flex align="center">
        <FeatherIcon icon="box" size="l" />
        <H1>Projects</H1>
      </Flex>

      <Text color="text1" size="h5">
        Sign in to unlock the power of projects:
      </Text>

      <List>
        <ListItem>Manage RPC API keys, view analytics, and configure alerts.</ListItem>
        <ListItem>Create and manage organizations.</ListItem>
        <ListItem>Invite team members to collaborate on multiple projects.</ListItem>
      </List>
    </Flex>
  );
}
