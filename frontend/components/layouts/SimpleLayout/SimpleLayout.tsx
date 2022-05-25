import type { ReactElement } from 'react';

import { Footer } from '../Footer';
import { Logo } from './Logo';
import * as S from './styles';

export function SimpleLayout({ children }: { children: ReactElement }) {
  return (
    <S.Wrapper>
      <S.Main>
        <Logo />
        {children}
      </S.Main>

      <Footer />
    </S.Wrapper>
  );
}
