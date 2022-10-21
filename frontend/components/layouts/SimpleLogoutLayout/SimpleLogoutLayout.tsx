import type { ReactElement } from 'react';

import * as DropdownMenu from '@/components/lib/DropdownMenu';
import { FeatherIcon } from '@/components/lib/FeatherIcon';
import { UserDropdown } from '@/components/lib/UserDropdown';
import { useIdentity } from '@/hooks/user';
import LogoSvg from '@/public/images/brand/pagoda-logo.svg';
import { logOut } from '@/utils/auth';

import { Footer } from '../Footer';
import * as S from './styles';

export function SimpleLogoutLayout({ children }: { children: ReactElement }) {
  const { identity } = useIdentity();

  return (
    <S.Wrapper>
      <S.Header>
        <LogoSvg style={{ height: '1.75rem', marginLeft: '0.35rem', alignSelf: 'center' }} />

        {identity && (
          <UserDropdown>
            <DropdownMenu.Item onSelect={logOut}>
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
