import { useRouter } from 'next/router';
import type { ReactNode } from 'react';

import { Box } from '@/components/lib/Box';
import { Container } from '@/components/lib/Container';
import { Flex } from '@/components/lib/Flex';
import { H1 } from '@/components/lib/Heading';
import { Section } from '@/components/lib/Section';
import { Text } from '@/components/lib/Text';
import Logo from '@/public/images/brand/pagoda-logo.svg';
import Circles from '@/public/images/circles.svg';

interface Props {
  children?: ReactNode;
}

export default function SmallScreenNotice({ children }: Props) {
  const router = useRouter();

  if (router.pathname === '/ui') return null;

  return (
    <>
      <Box
        css={{
          '@tablet': {
            display: 'none',
          },
        }}
      >
        {children}
      </Box>

      <Section css={{ margin: 'auto' }}>
        <Flex
          align="center"
          justify="center"
          css={{
            display: 'none',
            '@tablet': {
              display: 'flex',
            },
          }}
        >
          <Circles style={{ position: 'absolute', top: 'var(--size-header-height)', right: 0 }} />

          <Container size="s">
            <Flex stack gap="l">
              <H1>See you on the big screen!</H1>
              <Text>
                We’re working to deliver the best mobile experience possible. In the meantime, please visit this page on
                a device with a larger screen.
              </Text>
              <Logo style={{ height: '40px' }} />
            </Flex>
          </Container>
        </Flex>
      </Section>
    </>
  );
}
