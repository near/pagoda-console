import { useRouter } from 'next/router';
import type { ReactNode } from 'react';

import { NftInfoCard } from '@/modules/core/components/NftInfoCard';

import { Footer } from '../Footer';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import * as S from './styles';
import type { Redirect } from './types';

interface Props {
  children: ReactNode;
  redirect?: Redirect;
}

export function DashboardLayout({ children, redirect }: Props) {
  const router = useRouter();

  return (
    <>
      <Sidebar>
        <S.Wrapper>
          <Header redirect={redirect} />
          <S.Main>{children}</S.Main>
          <Footer />
        </S.Wrapper>
      </Sidebar>

      {router.pathname.startsWith('/tutorials/') && <NftInfoCard />}
    </>
  );
}
