import { useRouter } from 'next/router';
import type { ComponentProps, ReactNode } from 'react';

import { NftInfoCard } from '@/modules/core/components/NftInfoCard';

import { Footer } from '../Footer';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import * as S from './styles';

interface Props {
  children: ReactNode;
  redirect?: ComponentProps<typeof Header>['redirect'];
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
