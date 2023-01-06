import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';

import { Container } from '@/components/lib/Container';
import { Flex } from '@/components/lib/Flex';
import { Message } from '@/components/lib/Message';
import { Section } from '@/components/lib/Section';
import { Spinner } from '@/components/lib/Spinner';
import { useSimpleLayout } from '@/hooks/layouts';
import { mutationApi } from '@/utils/api';
import type { NextPageWithLayout } from '@/utils/types';

const Verification: NextPageWithLayout = () => {
  const [verificationMessage, setVerificationMessage] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const { token } = router.query;
  const hasSentRequest = useRef(false);

  useEffect(() => {
    if (typeof token !== 'string') {
      return;
    }

    if (!hasSentRequest.current) {
      sendVerification(token);
      hasSentRequest.current = true;
    }
  }, [token]);

  async function sendVerification(token: string) {
    try {
      await mutationApi('/alerts/verifyEmailDestination', { token }, false);
      setVerificationMessage('Your email destination is now ready to receive alerts! You may close this window.');
    } catch (e) {
      // TODO handle expired token
      console.error(e);
      setError('Something went wrong while trying to verify your email. Please check your destination.');
    }
  }

  return (
    <Section>
      <Container size="s">
        <Flex stack align="center">
          {!verificationMessage && !error && <Spinner size="m" />}
          {error && <Message content={error} type="error" />}
          {verificationMessage && <Message content={verificationMessage} type="success" />}
        </Flex>
      </Container>
    </Section>
  );
};

Verification.getLayout = useSimpleLayout;

export default Verification;
