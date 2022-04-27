import { getAuth, sendEmailVerification } from 'firebase/auth';
import router from 'next/router';
import { useEffect, useState } from 'react';
import { Button } from 'react-bootstrap';

import { useRouteParam } from '@/hooks/route';
import analytics from '@/utils/analytics';
import { logOut } from '@/utils/auth';
import { useSimpleLayout } from '@/utils/layouts';
import type { NextPageWithLayout } from '@/utils/types';

const Verification: NextPageWithLayout = () => {
  const [hasResent, setHasResent] = useState(false);

  const existing = useRouteParam('existing') === 'true';

  async function queueVerificationCheck() {
    return setTimeout(async () => {
      await getAuth().currentUser?.reload();
      if (getAuth().currentUser?.emailVerified) {
        analytics.track('DC Verify Account');
        router.push('/pick-project?onboarding=true');
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

  // only run once since it will re-queue itself
  useEffect(() => {
    queueVerificationCheck();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    router.prefetch('/pick-project');
  }, []);

  return (
    <div className="pageContainer">
      A verification message {existing ? 'was previously' : 'has been'} sent to your email address
      {!hasResent ? (
        <Button disabled={hasResent} onClick={resendVerification}>
          Send Again
        </Button>
      ) : (
        <div className="sentContainer">
          <span>Sent!</span>
        </div>
      )}
      <div className="signOut" onClick={logOut}>
        Log Out
      </div>
      <style jsx>{`
        .pageContainer {
          display: flex;
          flex-direction: column;
          row-gap: 2rem;
          align-content: center;
          width: 20.35rem;
          text-align: center;
        }
        .sentContainer {
          height: 2.625rem;
          color: var(--color-primary);
          display: flex;
        }
        .sentContainer > span {
          margin: auto auto;
        }
        .signOut {
          cursor: pointer;
          text-decoration: none;
        }
        .signOut:hover {
          color: var(--color-primary);
        }
      `}</style>
    </div>
  );
};

Verification.getLayout = useSimpleLayout;

export default Verification;
