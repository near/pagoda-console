import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

import { Button } from '@/components/lib/Button';
import { Card } from '@/components/lib/Card';
import { FeatherIcon } from '@/components/lib/FeatherIcon';
import { Flex } from '@/components/lib/Flex';
import { Text } from '@/components/lib/Text';
import { openToast } from '@/components/lib/Toast';

import type { Destination } from '../utils/types';

interface Props {
  destination: Destination;
}

export function WebhookDestinationSecret({ destination }: Props) {
  function copySecret() {
    navigator.clipboard.writeText(`Bearer ${destination.secret}`);

    openToast({
      type: 'success',
      title: 'Secret copied to clipboard.',
    });
  }

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
          <Button size="s" color="transparent" onClick={copySecret} css={{ marginLeft: 'auto' }}>
            <FeatherIcon icon="copy" size="xs" />
            <VisuallyHidden>Copy Secret</VisuallyHidden>
          </Button>
        </Flex>
      </Card>
    </Flex>
  );
}
