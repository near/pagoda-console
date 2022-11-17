import type { Api } from '@pc/common/types/api';
import { useCallback } from 'react';

import { Button } from '@/components/lib/Button';
import { Flex } from '@/components/lib/Flex';
import { Text } from '@/components/lib/Text';
import { openToast } from '@/components/lib/Toast';
import { useMutation } from '@/hooks/mutation';
import { StableId } from '@/utils/stable-ids';

type Destination = Api.Query.Output<'/alerts/listDestinations'>[number];

interface Props {
  destination: Destination;
}

export function EmailDestinationVerification({ destination }: Props) {
  const resendEmailVerificationMutation = useMutation('/alerts/resendEmailVerification', {
    onSuccess: () => {
      openToast({
        type: 'success',
        title: 'Verification Sent',
        description: 'Check your inbox and spam folder.',
      });
    },
    onError: () => {
      openToast({
        type: 'error',
        title: 'Send Failure',
        description: `Failed to send verification email. Please try again later.`,
      });
    },
    getAnalyticsSuccessData: ({ destinationId }) => ({ name: destinationId }),
    getAnalyticsErrorData: ({ destinationId }) => ({ name: destinationId }),
  });

  const resend = useCallback(() => {
    resendEmailVerificationMutation.mutate({ destinationId: destination.id });
  }, [destination.id, resendEmailVerificationMutation]);

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
          loading={resendEmailVerificationMutation.isLoading}
          onClick={resend}
        >
          Resend Verification Email
        </Button>
      </Flex>
    </Flex>
  );
}
