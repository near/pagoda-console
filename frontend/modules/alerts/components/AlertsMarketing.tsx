import { FeatherIcon } from '@/components/lib/FeatherIcon';
import { Flex } from '@/components/lib/Flex';
import { H1 } from '@/components/lib/Heading';
import { List, ListItem } from '@/components/lib/List';
import { Text } from '@/components/lib/Text';

export function AlertsMarketing() {
  return (
    <Flex stack gap="l">
      <Flex align="center">
        <FeatherIcon icon="bell" size="l" />
        <H1>Alerts</H1>
      </Flex>

      <Text color="text1" size="h5">
        Sign in to unlock the power of alerts:
      </Text>

      <List>
        <ListItem>Configure alerts based on specific contract conditions.</ListItem>
        <ListItem>Set up email, webhook, and Telegram destinations.</ListItem>
        <ListItem>Browse all alert activity in real time.</ListItem>
      </List>
    </Flex>
  );
}
