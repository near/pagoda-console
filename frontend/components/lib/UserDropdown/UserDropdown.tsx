import type { ReactNode } from 'react';

import * as DropdownMenu from '@/components/lib/DropdownMenu';
import { FeatherIcon } from '@/components/lib/FeatherIcon';
import { Text } from '@/components/lib/Text';
import { useAccount } from '@/hooks/user';
import { StableId } from '@/utils/stable-ids';

export const UserDropdown = ({ children }: { children: ReactNode }) => {
  const { user } = useAccount();

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Button stableId={StableId.USER_DROPDOWN} color="transparent" css={{ height: 'auto' }}>
        <FeatherIcon icon="user" />
        <Text as="span" color="text1" family="body" weight="semibold">
          {user?.name}
        </Text>
      </DropdownMenu.Button>

      <DropdownMenu.Content align="end">{children}</DropdownMenu.Content>
    </DropdownMenu.Root>
  );
};
