import { useRouter } from 'next/router';
import type { ReactNode } from 'react';

import { NftInfoCard } from '@/components/NftInfoCard';

import { Footer } from '../Footer';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import * as S from './styles';

export function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();

  return (
    <>
      <Sidebar>
        <S.Wrapper>
          <Header />
          <S.Main>{children}</S.Main>
          <Footer />
        </S.Wrapper>
      </Sidebar>

      {router.pathname.startsWith('/tutorials/') && <NftInfoCard />}
    </>
  );
}
