import { useRouter } from 'next/router';
import { useCallback } from 'react';

import * as DropdownMenu from '@/components/lib/DropdownMenu';
import { FeatherIcon } from '@/components/lib/FeatherIcon';
import { UserDropdown } from '@/components/lib/UserDropdown';
import { logOut } from '@/utils/auth';

export const UserFullDropdown = () => {
  const router = useRouter();

  const onSelectOrganizations = useCallback(() => router.push('/organizations'), [router]);
  const onSelectUserSettings = useCallback(() => router.push('/settings'), [router]);

  return (
    <UserDropdown>
      <DropdownMenu.Item onSelect={onSelectUserSettings}>
        <FeatherIcon icon="settings" />
        User Settings
      </DropdownMenu.Item>

      <DropdownMenu.Item onSelect={onSelectOrganizations}>
        <FeatherIcon icon="users" />
        Organizations
      </DropdownMenu.Item>

      <DropdownMenu.Item onSelect={logOut}>
        <FeatherIcon icon="log-out" />
        Logout
      </DropdownMenu.Item>
    </UserDropdown>
  );
};
