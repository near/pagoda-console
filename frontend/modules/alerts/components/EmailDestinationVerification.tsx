import type { Api } from '@pc/common/types/api';

import { Button } from '@/components/lib/Button';
import { Flex } from '@/components/lib/Flex';
import { Text } from '@/components/lib/Text';
import { openToast } from '@/components/lib/Toast';
import { useApiMutation } from '@/hooks/api-mutation';
import analytics from '@/utils/analytics';
import { handleMutationError } from '@/utils/error-handlers';
import { StableId } from '@/utils/stable-ids';

type Destination = Api.Query.Output<'/alerts/listDestinations'>[number];

interface Props {
  destination: Destination;
}

export function EmailDestinationVerification({ destination }: Props) {
  const resendEmailMutation = useApiMutation('/alerts/resendEmailVerification', {
    onSuccess: () => {
      analytics.track('DC Resend Email Verification for Email Destination', {
        status: 'success',
        name: destination.id,
      });

      openToast({
        type: 'success',
        title: 'Verification Sent',
        description: 'Check your inbox and spam folder.',
      });
    },

    onError: (error) => {
      handleMutationError({
        error,
        eventLabel: 'DC Resend Email Verification for Email Destination',
        toastTitle: 'Send Failure',
        toastDescription: `Failed to send verification email. Please try again later.`,
      });
    },
  });

  function resend() {
    resendEmailMutation.mutate({
      destinationId: destination.id,
    });
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
          loading={resendEmailMutation.isLoading}
          onClick={resend}
        >
          Resend Verification Email
        </Button>
      </Flex>
    </Flex>
  );
}
