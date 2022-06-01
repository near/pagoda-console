import type { ReactElement } from 'react';

import * as DropdownMenu from '@/components/lib/DropdownMenu';
import { FeatherIcon } from '@/components/lib/FeatherIcon';
import { Flex } from '@/components/lib/Flex';
import { useAccount } from '@/hooks/user';
import LogoSvg from '@/public/images/brand/pagoda-logo.svg';
import { logOut } from '@/utils/auth';

import { Footer } from '../Footer';
import * as S from './styles';

export function SimpleLogoutLayout({ children }: { children: ReactElement }) {
  const { user } = useAccount();

  function onSelectLogout() {
    logOut();
  }

  return (
    <S.Wrapper>
      <S.Header>
        <Flex align="center" justify="spaceBetween">
          <LogoSvg style={{ height: '2.125rem', marginLeft: 'var(--space-s)' }} />

          <DropdownMenu.Root>
            <DropdownMenu.Button color="transparent">
              <FeatherIcon icon="user" /> {user?.name}
            </DropdownMenu.Button>

            <DropdownMenu.Content align="end">
              <DropdownMenu.Item onSelect={() => onSelectLogout()}>
                <FeatherIcon icon="log-out" />
                Logout
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        </Flex>
      </S.Header>

      <S.Main>{children}</S.Main>

      <Footer />
    </S.Wrapper>
  );
}
