import { useMutation } from '@tanstack/react-query';
import { applyActionCode, getAuth } from 'firebase/auth';
import * as React from 'react';

import { Button, ButtonLink } from '@/components/lib/Button';
import { Flex } from '@/components/lib/Flex';
import { Message } from '@/components/lib/Message';
import { Spinner } from '@/components/lib/Spinner';
import { useSignedInHandler } from '@/hooks/auth';
import { useRouteParam } from '@/hooks/route';
import { StableId } from '@/utils/stable-ids';

const EmailVerification = () => {
  const [verificationMessage, setVerificationMessage] = React.useState('');
  const [error, setError] = React.useState('');
  const verifyCode = useRouteParam('oobCode');
  const signedInHandler = useSignedInHandler();
  const hasSentRequest = React.useRef(false);
  const verifyEmailMutation = useMutation<any, unknown, string>(
    (verifyCode) => {
      return applyActionCode(getAuth(), verifyCode);
    },
    {
      onSuccess: () => {
        setVerificationMessage('Email Verified!');
      },
      onError: (error) => {
        console.error(error);
        setError('Something went wrong while trying to verify your email.');
      },
    },
  );

  const verifyEmail = React.useCallback(() => {
    if (!verifyCode) {
      return;
    }
    verifyEmailMutation.mutate(verifyCode);
  }, [verifyCode, verifyEmailMutation]);
  React.useEffect(() => {
    if (!hasSentRequest.current) {
      verifyEmail();
      hasSentRequest.current = true;
    }
  }, [verifyEmail]);

  return (
    <Flex stack gap="l">
      {!verificationMessage && !error && <Spinner center size="m" />}
      {error && <Message content={error} type="error" />}
      {verificationMessage ? (
        <>
          <Message content={verificationMessage} type="success" />
          <Button
            stretch
            color="primary"
            stableId={StableId.REGISTER_BACK_TO_SIGN_IN}
            onClick={() => signedInHandler('/pick-project')}
          >
            Back to Sign In
          </Button>
        </>
      ) : (
        <ButtonLink stretch color="primary" stableId={StableId.REGISTER_BACK_TO_SIGN_IN} href="/">
          Back to Sign In
        </ButtonLink>
      )}
    </Flex>
  );
};

export default EmailVerification;
