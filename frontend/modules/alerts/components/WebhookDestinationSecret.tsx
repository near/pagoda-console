import { Card } from '@/components/lib/Card';
import { Flex } from '@/components/lib/Flex';
import { Text } from '@/components/lib/Text';

import type { Destination } from '../utils/types';

interface Props {
  destination: Destination;
}

export function WebhookDestinationSecret({ destination }: Props) {
  return (
    <Flex stack>
      <Text>
        When we send data to this webhook, we&apos;ll include the following secret in our headers so that you know
        it&apos;s us:
      </Text>

      <Card padding="m" borderRadius="m">
        <Flex>
          <Text family="code">Authorization:</Text>
          <Text family="code" color="text1" weight="semibold">
            Bearer {destination.secret}
          </Text>
        </Flex>
      </Card>
    </Flex>
  );
}
