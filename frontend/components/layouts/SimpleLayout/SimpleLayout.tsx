import type { ReactElement } from 'react';

import LogoSvg from '@/public/images/brand/pagoda-logo.svg';

import { Footer } from '../Footer';
import * as S from './styles';

export function SimpleLayout({ children, noPadding }: { children: ReactElement; noPadding?: boolean }) {
  return (
    <S.Wrapper>
      <S.Header>
        <LogoSvg style={{ height: '1.75rem', marginLeft: '0.35rem', alignSelf: 'center' }} />
      </S.Header>

      <S.Main noPadding={noPadding}>{children}</S.Main>

      <Footer />
    </S.Wrapper>
  );
}
