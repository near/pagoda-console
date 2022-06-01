import type { ReactElement } from 'react';

import { Flex } from '@/components/lib/Flex';
import { H1 } from '@/components/lib/Heading';
import LogoSvg from '@/public/images/brand/pagoda-logo.svg';

import { Footer } from '../Footer';
import * as S from './styles';

export function SimpleLayout({ children }: { children: ReactElement }) {
  return (
    <S.Wrapper>
      <S.Main>
        <Flex stack align="center" gap="s">
          <LogoSvg style={{ width: '92px' }} />

          <H1
            css={{
              fontSize: '2.4rem',
              fontFamily: 'var(--font-body)',
              fontWeight: 400,
              letterSpacing: '-0.02em',
              textAlign: 'center',
            }}
          >
            Developer Console
          </H1>
        </Flex>

        {children}
      </S.Main>

      <Footer />
    </S.Wrapper>
  );
}
