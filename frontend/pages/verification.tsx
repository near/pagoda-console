import { getAuth, sendEmailVerification } from 'firebase/auth';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useRef, useState } from 'react';

import { Button } from '@/components/lib/Button';
import { Container } from '@/components/lib/Container';
import { Flex } from '@/components/lib/Flex';
import { Section } from '@/components/lib/Section';
import { Text } from '@/components/lib/Text';
import { TextButton } from '@/components/lib/TextLink';
import { useSignedInHandler, useSignOut } from '@/hooks/auth';
import { useSimpleLayout } from '@/hooks/layouts';
import { useRouteParam } from '@/hooks/route';
import analytics from '@/utils/analytics';
import { authenticatedPost } from '@/utils/http';
import { StableId } from '@/utils/stable-ids';
import type { NextPageWithLayout } from '@/utils/types';

const Verification: NextPageWithLayout = () => {
  const router = useRouter();
  const [hasResent, setHasResent] = useState(false);
  const existing = useRouteParam('existing') === 'true';
  const hasCalledInitAccount = useRef(false);
  const verificationCheckTimer = useRef<NodeJS.Timeout | undefined>();
  const signOut = useSignOut();
  const signedInHandler = useSignedInHandler();

  const queueVerificationCheck = useCallback(() => {
    verificationCheckTimer.current = setTimeout(async () => {
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
        signedInHandler('/pick-project?onboarding=true');
      } else {
        queueVerificationCheck();
      }
    }, 3000);
  }, [signedInHandler]);

  useEffect(() => {
    router.prefetch('/pick-project');
  }, [router]);

  // send off a trivial request to make sure this user is initialized in DB
  useEffect(() => {
    if (!hasCalledInitAccount.current) {
      initAccount();
      hasCalledInitAccount.current = true;
    }
  }, []);
  async function initAccount() {
    try {
      await authenticatedPost('/users/getAccountDetails');
    } catch (e) {
      // silently fail
    }
  }

  useEffect(() => {
    queueVerificationCheck(); // only run once since it will re-queue itself

    return () => {
      clearTimeout(verificationCheckTimer.current);
    };
  }, [queueVerificationCheck]);

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
    <Section>
      <Container size="xs" css={{ textAlign: 'center' }}>
        <Flex stack align="center">
          <Text>
            A verification message {existing ? 'was previously' : 'has been'} sent to your email address.{' '}
            {existing && 'If it has expired, click below to send a new one:'}
          </Text>

          {!hasResent ? (
            <Button
              stableId={StableId.ACCOUNT_VERIFICATION_SEND_AGAIN_BUTTON}
              stretch
              disabled={hasResent}
              onClick={resendVerification}
            >
              Send Again
            </Button>
          ) : (
            <Text color="primary">Sent!</Text>
          )}
          <TextButton stableId={StableId.ACCOUNT_VERIFICATION_LOG_OUT_BUTTON} color="neutral" onClick={signOut}>
            Log Out
          </TextButton>
        </Flex>
      </Container>
    </Section>
  );
};

Verification.getLayout = useSimpleLayout;

export default Verification;
