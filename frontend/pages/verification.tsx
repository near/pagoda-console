import { getAuth, sendEmailVerification } from 'firebase/auth';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import { Button } from '@/components/lib/Button';
import { Container } from '@/components/lib/Container';
import { Flex } from '@/components/lib/Flex';
import { Text } from '@/components/lib/Text';
import { TextButton } from '@/components/lib/TextLink';
import { useSimpleLayout } from '@/hooks/layouts';
import { useRouteParam } from '@/hooks/route';
import analytics from '@/utils/analytics';
import { logOut } from '@/utils/auth';
import { signInRedirectHandler } from '@/utils/helpers';
import type { NextPageWithLayout } from '@/utils/types';

const Verification: NextPageWithLayout = () => {
  const router = useRouter();
  const [hasResent, setHasResent] = useState(false);
  const existing = useRouteParam('existing') === 'true';

  useEffect(() => {
    router.prefetch('/pick-project');
  }, [router]);

  useEffect(() => {
    queueVerificationCheck(); // only run once since it will re-queue itself
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function queueVerificationCheck() {
    return setTimeout(async () => {
      await getAuth().currentUser?.reload();
      if (getAuth().currentUser?.emailVerified) {
        await getAuth().currentUser?.getIdToken(true);
        /*
          Without calling getIdToken(true) to force refresh the auth token,
          all future API calls will 401 with an invalid auth token. We might
          want to investigate this logic in the future. You would think the
          reload() call above would be enough, but it isn't.
        */
        analytics.track('DC Verify Account');
        signInRedirectHandler(router, '/pick-project?onboarding=true');
      } else {
        queueVerificationCheck();
      }
    }, 3000);
  }

  async function resendVerification() {
    try {
      const user = getAuth().currentUser;
      if (!user) {
        throw new Error('User not logged in');
      }
      await sendEmailVerification(user);
      analytics.track('DC Resent verification email');
      setHasResent(true);
    } catch (e) {
      // TODO display error
      console.error(e);
    }
  }

  return (
    <Container size="xs" css={{ textAlign: 'center' }}>
      <Flex stack align="center">
        <Text>
          A verification message {existing ? 'was previously' : 'has been'} sent to your email address.{' '}
          {existing && 'If it has expired, click below to send a new one:'}
        </Text>

        {!hasResent ? (
          <Button stretch disabled={hasResent} onClick={resendVerification}>
            Send Again
          </Button>
        ) : (
          <Text color="primary">Sent!</Text>
        )}
        <TextButton color="neutral" onClick={logOut}>
          Log Out
        </TextButton>
      </Flex>
    </Container>
  );
};

Verification.getLayout = useSimpleLayout;

export default Verification;
