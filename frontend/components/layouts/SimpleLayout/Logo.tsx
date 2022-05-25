import { Flex } from '@/components/lib/Flex';
import { H1 } from '@/components/lib/Heading';
import LogoSvg from '@/public/images/brand/pagoda-logo.svg';

export function Logo() {
  return (
    <Flex stack align="center" gap="s">
      <LogoSvg style={{ width: '92px', height: 'auto', maxWidth: '100%' }} />

      <H1
        css={{
          fontSize: '2.5rem',
          fontFamily: 'var(--font-body)',
          fontWeight: 400,
          letterSpacing: '-0.02em',
          textAlign: 'center',
        }}
      >
        Developer Console
      </H1>
    </Flex>
  );
}
