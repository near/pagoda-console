import { useRouter } from 'next/router';
import type { ReactElement } from 'react';
import { useEffect } from 'react';

import { Container } from '@/components/lib/Container';
import { Flex } from '@/components/lib/Flex';
import { useAuth } from '@/hooks/auth';
import { AuthForm } from '@/modules/core/components/AuthForm';

import { H2 } from './lib/Heading';
import { Section } from './lib/Section';

interface Props {
  authenticated: ReactElement;
  unauthenticated: ReactElement;
}

export function AuthStatusRenderer(props: Props) {
  const { authStatus } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (authStatus === 'UNAUTHENTICATED') {
      sessionStorage.setItem('signInRedirectUrl', router.asPath);
    }
  }, [authStatus, router.asPath]);

  switch (authStatus) {
    case 'AUTHENTICATED':
      return props.authenticated;
    case 'UNAUTHENTICATED':
      return <UnauthenticatedPrompt>{props.unauthenticated}</UnauthenticatedPrompt>;
    case 'LOADING':
      return null;
  }
}

function UnauthenticatedPrompt({ children }: { children: ReactElement }) {
  return (
    <Flex align="stretch" stack={{ '@laptop': true }} css={{ flexGrow: 1 }}>
      <Section noBorder css={{ display: 'flex', alignItems: 'center' }}>
        <Container css={{ maxWidth: '32.5rem' }}>{children}</Container>
      </Section>

      <Section background="surface2" css={{ display: 'flex', alignItems: 'center' }}>
        <Container size="xs">
          <Flex stack gap="l">
            <H2>Sign In</H2>
            <AuthForm />
          </Flex>
        </Container>
      </Section>
    </Flex>
  );
}
