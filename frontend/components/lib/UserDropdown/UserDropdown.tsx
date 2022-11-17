import type { ReactNode } from 'react';

import * as DropdownMenu from '@/components/lib/DropdownMenu';
import { FeatherIcon } from '@/components/lib/FeatherIcon';
import { Text } from '@/components/lib/Text';
import { useQuery } from '@/hooks/query';
import { StableId } from '@/utils/stable-ids';

export const UserDropdown = ({ children }: { children: ReactNode }) => {
  const userQuery = useQuery(['/users/getAccountDetails']);

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Button stableId={StableId.USER_DROPDOWN} color="transparent" css={{ height: 'auto' }}>
        <FeatherIcon icon="user" />
        <Text as="span" color="text1" family="body" weight="semibold">
          {userQuery.data?.name}
        </Text>
      </DropdownMenu.Button>

      <DropdownMenu.Content align="end">{children}</DropdownMenu.Content>
    </DropdownMenu.Root>
  );
};
