import * as React from 'react';

import { SimpleLayout } from '@/components/layouts/SimpleLayout';
import { Container } from '@/components/lib/Container';
import { Section } from '@/components/lib/Section';
import { Spinner } from '@/components/lib/Spinner';
import { useRouteParam } from '@/hooks/route';

import EmailVerification from './email-verification';
import ResetPassword from './reset-password';

// https://firebase.google.com/docs/auth/custom-email-handler#create_the_email_action_handler_page
type ManagementAction = 'resetPassword' | 'recoverEmail' | 'verifyEmail';

const AuthActionHandler = () => {
  const actionType = useRouteParam('mode') as ManagementAction;

  return (
    <SimpleLayout>
      <Section>
        <Container size="xs">
          {!actionType ? (
            <Spinner center />
          ) : actionType === 'verifyEmail' ? (
            <EmailVerification />
          ) : actionType === 'resetPassword' ? (
            <ResetPassword />
          ) : null}
        </Container>
      </Section>
    </SimpleLayout>
  );
};

export default AuthActionHandler;
