import { useRouter } from 'next/router';
import { useEffect } from 'react';

import { Container } from '@/components/lib/Container';
import { Flex } from '@/components/lib/Flex';
import { Message } from '@/components/lib/Message';
import { Spinner } from '@/components/lib/Spinner';
import { useSimpleLayout } from '@/hooks/layouts';
import { useMutation } from '@/hooks/mutation';
import type { NextPageWithLayout } from '@/utils/types';

const Unsubscribe: NextPageWithLayout = () => {
  const router = useRouter();
  const { token } = router.query;

  const unsubscribeFromEmailAlertMutation = useMutation('/alerts/unsubscribeFromEmailAlert', { unauth: true });
  useEffect(() => {
    if (typeof token !== 'string') {
      return;
    }
    unsubscribeFromEmailAlertMutation.mutate({ token });
  }, [token, unsubscribeFromEmailAlertMutation]);

  return (
    <Container size="s">
      <Flex stack align="center">
        {unsubscribeFromEmailAlertMutation.status === 'loading' ? (
          <Spinner size="m" />
        ) : unsubscribeFromEmailAlertMutation.status === 'error' ? (
          <Message content="Something went wrong while trying to unsubscribe from this email alert." type="error" />
        ) : unsubscribeFromEmailAlertMutation.status === 'idle' ? (
          <Message content="Something is wrong with the token. Please verify the link." />
        ) : (
          <Message
            content="You have successfully unsubscribed from this email alert. You may close this window."
            type="success"
          />
        )}
      </Flex>
    </Container>
  );
};

Unsubscribe.getLayout = useSimpleLayout;

export default Unsubscribe;
