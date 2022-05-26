import { useRouter } from 'next/router';

import Logo from '@/public/images/brand/pagoda-logo.svg';
import Circles from '@/public/images/circles.svg';

import { Container } from './lib/Container';
import { Flex } from './lib/Flex';
import { H1 } from './lib/Heading';
import { P } from './lib/Paragraph';

export default function SmallScreenNotice() {
  const router = useRouter();

  if (router.pathname === '/ui') return null;

  return (
    <Flex
      align="center"
      justify="center"
      css={{
        display: 'none',
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        background: 'var(--color-surface-3)',

        '@tablet': {
          display: 'flex',
        },
      }}
    >
      <Circles style={{ position: 'absolute', top: 0, right: 0 }} />

      <Container size="s">
        <Flex stack gap="l">
          <H1>See you on the big screen!</H1>
          <P>
            We’re working to deliver the best mobile experience possible. In the meantime, please visit us on a device
            with a larger screen.
          </P>
          <Logo style={{ height: '40px' }} />
        </Flex>
      </Container>
    </Flex>
  );
}
