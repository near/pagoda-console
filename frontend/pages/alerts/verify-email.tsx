import { useRouter } from 'next/router';
import { useEffect } from 'react';

import { Container } from '@/components/lib/Container';
import { Flex } from '@/components/lib/Flex';
import { Message } from '@/components/lib/Message';
import { Section } from '@/components/lib/Section';
import { Spinner } from '@/components/lib/Spinner';
import { useSimpleLayout } from '@/hooks/layouts';
import { useMutation } from '@/hooks/mutation';
import type { NextPageWithLayout } from '@/utils/types';

const Verification: NextPageWithLayout = () => {
  const router = useRouter();
  const { token } = router.query;
  const verifyEmailDestinationMutation = useMutation('/alerts/verifyEmailDestination', { unauth: true });
  useEffect(() => {
    if (typeof token !== 'string') {
      return;
    }
    verifyEmailDestinationMutation.mutate({ token });
  }, [token, verifyEmailDestinationMutation]);

  return (
    <Section>
      <Container size="s">
        <Flex stack align="center">
          {verifyEmailDestinationMutation.status === 'loading' ? (
            <Spinner size="m" />
          ) : verifyEmailDestinationMutation.status === 'error' ? (
            <Message
              content="Something went wrong while trying to verify your email. Please check your destination."
              type="error"
            />
          ) : verifyEmailDestinationMutation.status === 'idle' ? (
            <Message content="Something is wrong with the token. Please verify the link." />
          ) : (
            <Message
              content="Your email destination is now ready to receive alerts! You may close this window."
              type="success"
            />
          )}
        </Flex>
      </Container>
    </Section>
  );
};

Verification.getLayout = useSimpleLayout;

export default Verification;
