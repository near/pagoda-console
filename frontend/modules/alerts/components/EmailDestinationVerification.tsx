import { useState } from 'react';

import { Button } from '@/components/lib/Button';
import { Flex } from '@/components/lib/Flex';
import { Text } from '@/components/lib/Text';
import { StableId } from '@/utils/stable-ids';

import { resendEmailVerification } from '../hooks/destinations';
import type { Destination } from '../utils/types';

interface Props {
  destination: Destination;
}

export function EmailDestinationVerification({ destination }: Props) {
  const [isSending, setIsSending] = useState(false);

  async function resend() {
    setIsSending(true);
    await resendEmailVerification(destination.id);
    setIsSending(false);
  }

  if (destination.type !== 'EMAIL') return null;

  return (
    <Flex stack gap="l">
      <Text>
        {`To finish setting up this destination, please verify your destination's email address. Check your inbox and spam
        folder for the verification link we just sent to: `}
        <Text as="span" color="text1" weight="semibold">
          {destination.config.email}
        </Text>
      </Text>

      <Flex>
        <Button
          stableId={StableId.EMAIL_DESTINATION_VERIFICATION_RESEND_BUTTON}
          color="neutral"
          loading={isSending}
          onClick={resend}
        >
          Resend Verification Email
        </Button>
      </Flex>
    </Flex>
  );
}
