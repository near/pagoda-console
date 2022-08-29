import type { ReactElement } from 'react';

import * as DropdownMenu from '@/components/lib/DropdownMenu';
import { FeatherIcon } from '@/components/lib/FeatherIcon';
import { Text } from '@/components/lib/Text';
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
        <LogoSvg style={{ height: '1.75rem', marginLeft: '0.35rem', alignSelf: 'center' }} />

        <DropdownMenu.Root>
          <DropdownMenu.Button color="transparent" css={{ height: 'auto' }}>
            <FeatherIcon icon="user" />
            <Text as="span" color="text1" family="body" weight="semibold">
              {user?.name}
            </Text>
          </DropdownMenu.Button>

          <DropdownMenu.Content align="end">
            <DropdownMenu.Item onSelect={() => onSelectLogout()}>
              <FeatherIcon icon="log-out" />
              Logout
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      </S.Header>

      <S.Main>{children}</S.Main>

      <Footer />
    </S.Wrapper>
  );
}
