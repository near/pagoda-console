import { Card } from '@/components/lib/Card';
import { CopyButton } from '@/components/lib/CopyButton';
import { Flex } from '@/components/lib/Flex';
import { Text } from '@/components/lib/Text';

import type { Destination } from '../utils/types';

interface Props {
  destination: Destination;
}

export function WebhookDestinationSecret({ destination }: Props) {
  if (destination.type !== 'WEBHOOK') return null;

  const authorizationHeader = `Bearer ${destination.config.secret}`;

  return (
    <Flex stack>
      <Text>
        When we send data to this webhook, we&apos;ll include the following secret in our headers so that you know
        it&apos;s us:
      </Text>

      <Card padding="m" borderRadius="m" border>
        <Flex>
          <Text family="code">Authorization:</Text>
          <Text family="code" color="text1" weight="semibold">
            {authorizationHeader}
          </Text>
          <CopyButton value={authorizationHeader} css={{ marginLeft: 'auto' }} color="transparent" />
        </Flex>
      </Card>
    </Flex>
  );
}
