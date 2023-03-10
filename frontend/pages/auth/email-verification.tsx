import { useMutation } from '@tanstack/react-query';
import { applyActionCode, getAuth } from 'firebase/auth';
import * as React from 'react';

import { ButtonLink } from '@/components/lib/Button';
import { Flex } from '@/components/lib/Flex';
import { Message } from '@/components/lib/Message';
import { StableId } from '@/utils/stable-ids';

interface Props {
  verifyCode: string | null;
}

const EmailVerification = ({ verifyCode }: Props) => {
  const verifyEmailMutation = useMutation<any, unknown, string>(
    async (verifyCode) => {
      return await applyActionCode(getAuth(), verifyCode!);
    },
    {
      onSuccess: () => {
        console.log('succeded');
      },
      onError: (error) => {
        console.error(error);
      },
    },
  );

  const verifyEmail = React.useCallback(
    () => verifyEmailMutation.mutate(verifyCode!),
    [verifyCode, verifyEmailMutation],
  );
  React.useEffect(() => {
    if (verifyEmailMutation.status !== 'idle') return;
    verifyEmail();
  }, [verifyEmail, verifyEmailMutation.status]);

  return (
    <Flex stack gap="l">
      {verifyEmailMutation.status === 'success' ? <Message type="success" content="Email Verified!" /> : null}

      <ButtonLink href="/" stableId={StableId.REGISTER_BACK_TO_SIGN_IN} color="primary" stretch>
        Back to Sign In
      </ButtonLink>
    </Flex>
  );
};

export default EmailVerification;
