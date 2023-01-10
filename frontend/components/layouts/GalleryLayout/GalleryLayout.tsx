import type { ReactElement } from 'react';

import LogoSvg from '@/public/images/brand/pagoda-logo.svg';

import { Footer } from '../Footer';
import * as S from './styles';

export const GalleryLayout = ({ children }: { children: ReactElement }) => {
  return (
    <S.Wrapper>
      <S.Header>
        <LogoSvg style={{ height: '2.4rem', alignSelf: 'center' }} />
      </S.Header>
      <S.Main>{children}</S.Main>
      <Footer />
    </S.Wrapper>
  );
};
