import type { ComponentProps } from '@stitches/react';
import { useRouter } from 'next/router';

import { ProjectSelector } from '@/components/layouts/DashboardLayout/ProjectSelector';
import * as DropdownMenu from '@/components/lib/DropdownMenu';
import { FeatherIcon } from '@/components/lib/FeatherIcon';
import { Flex } from '@/components/lib/Flex';
import { Font } from '@/components/lib/Font';
import { useAccount } from '@/hooks/user';
import { logOut } from '@/utils/auth';

import { EnvironmentSelector } from '../EnvironmentSelector';
import * as S from './styles';

type Props = ComponentProps<typeof S.Header>;

export function Header(props: Props) {
  const router = useRouter();
  const { user } = useAccount();

  function onSelectLogout() {
    logOut();
  }

  function onSelectUserSettings() {
    router.push('/settings');
  }

  return (
    <S.Header {...props}>
      <Flex align="center" justify="spaceBetween">
        <Flex align="center">
          <ProjectSelector />
          <EnvironmentSelector />
        </Flex>

        <DropdownMenu.Root>
          <DropdownMenu.Button color="transparent">
            <FeatherIcon icon="user" />
            <Font family="body" css={{ fontWeight: 600 }}>
              {user?.name}
            </Font>
          </DropdownMenu.Button>

          <DropdownMenu.Content align="end">
            <DropdownMenu.Item onSelect={() => onSelectUserSettings()}>
              <FeatherIcon icon="settings" />
              User Settings
            </DropdownMenu.Item>

            <DropdownMenu.Item onSelect={() => onSelectLogout()}>
              <FeatherIcon icon="log-out" />
              Logout
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      </Flex>
    </S.Header>
  );
}
