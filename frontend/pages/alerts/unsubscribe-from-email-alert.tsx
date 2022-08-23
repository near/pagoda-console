import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import { Container } from '@/components/lib/Container';
import { Flex } from '@/components/lib/Flex';
import { Message } from '@/components/lib/Message';
import { Spinner } from '@/components/lib/Spinner';
import { useSimpleLayout } from '@/hooks/layouts';
import { unauthenticatedPost } from '@/utils/http';
import type { NextPageWithLayout } from '@/utils/types';

const Unsubscribe: NextPageWithLayout = () => {
  const [unsubscribeMessage, setUnsubscribeMessage] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const { token } = router.query;

  useEffect(() => {
    if (typeof token !== 'string') {
      return;
    }

    sendUnsubscribeRequest(token);
  }, [token]);

  async function sendUnsubscribeRequest(token: string) {
    try {
      await unauthenticatedPost('/alerts/unsubscribeFromEmailAlert', {
        token,
      });
      setUnsubscribeMessage('You have successfully unsubscribed from this email alert. You may close this window.');
    } catch (e) {
      console.error(e);
      setError('Something went wrong while trying to unsubscribe from this email alert.');
    }
  }

  return (
    <Container size="s">
      <Flex stack align="center">
        {!unsubscribeMessage && !error && <Spinner size="m" />}
        {error && <Message content={error} type="error" />}
        {unsubscribeMessage && <Message content={unsubscribeMessage} type="success" />}
      </Flex>
    </Container>
  );
};

Unsubscribe.getLayout = useSimpleLayout;

export default Unsubscribe;
