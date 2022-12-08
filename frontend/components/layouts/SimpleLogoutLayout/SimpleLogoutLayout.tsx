import type { ReactElement } from 'react';

import * as DropdownMenu from '@/components/lib/DropdownMenu';
import { FeatherIcon } from '@/components/lib/FeatherIcon';
import { UserDropdown } from '@/components/lib/UserDropdown';
import { useSignOut } from '@/hooks/auth';
import { useAuth } from '@/hooks/auth';
import LogoSvg from '@/public/images/brand/pagoda-logo.svg';

import { Footer } from '../Footer';
import * as S from './styles';

export function SimpleLogoutLayout({ children }: { children: ReactElement }) {
  const { authStatus } = useAuth();
  const signOut = useSignOut();

  return (
    <S.Wrapper>
      <S.Header>
        <LogoSvg style={{ height: '1.75rem', marginLeft: '0.35rem', alignSelf: 'center' }} />

        {authStatus === 'AUTHENTICATED' && (
          <UserDropdown>
            <DropdownMenu.Item onSelect={signOut}>
              <FeatherIcon icon="log-out" />
              Logout
            </DropdownMenu.Item>
          </UserDropdown>
        )}
      </S.Header>

      <S.Main>{children}</S.Main>

      <Footer />
    </S.Wrapper>
  );
}
