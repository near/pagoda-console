import { useRouter } from 'next/router';
import { useEffect } from 'react';

import { Box } from '@/components/lib/Box';
import { Button } from '@/components/lib/Button';
import { FeatherIcon } from '@/components/lib/FeatherIcon';
import { Flex } from '@/components/lib/Flex';
import { SubnetIcon } from '@/components/lib/SubnetIcon';
import { Text } from '@/components/lib/Text';
import { Tooltip } from '@/components/lib/Tooltip';
import { useAuth } from '@/hooks/auth';
import { usePublicMode } from '@/hooks/public';
import { usePublicStore } from '@/stores/public';
import { mapEnvironmentSubIdToNet } from '@/utils/helpers';
import { StableId } from '@/utils/stable-ids';

export function PublicHeader() {
  const { authStatus } = useAuth();
  const publicModeHasHydrated = usePublicStore((store) => store.hasHydrated);
  const publicContracts = usePublicStore((store) => store.contracts);
  const publicEnvironmentSubId = publicModeHasHydrated ? (publicContracts[0]?.net === 'MAINNET' ? 2 : 1) : undefined;
  const publicNet = publicEnvironmentSubId === undefined ? undefined : mapEnvironmentSubIdToNet(publicEnvironmentSubId);
  const { deactivatePublicMode } = usePublicMode();
  const router = useRouter();

  useEffect(() => {
    router.prefetch('/projects');
  }, [router]);

  function exitPublicMode() {
    router.replace('/projects');
    deactivatePublicMode();
  }

  return (
    <Flex align="center" gap="m" autoWidth>
      <Text size="bodySmall" color="text3" css={{ whiteSpace: 'nowrap' }}>
        Viewing contracts on:
      </Text>

      <Flex align="center" gap="xs" autoWidth>
        <SubnetIcon net={publicNet} size="xs" />
        <Text family="code" color="text1" weight="semibold" size="bodySmall">
          {publicNet ? `${publicNet[0]}${publicNet.slice(1).toLowerCase()}` : ''}
        </Text>
      </Flex>

      {authStatus === 'AUTHENTICATED' && (
        <Box css={{ borderLeft: '1px solid var(--color-border-2)', paddingLeft: 'calc(var(--space-m) * 0.4)' }}>
          <Tooltip content="Return to your projects">
            <Button
              stableId={StableId.HEADER_EXIT_PUBLIC_CONTRACTS_BUTTON}
              color="transparent"
              size="s"
              aria-label="Return to your projects"
              onClick={exitPublicMode}
            >
              <FeatherIcon icon="x" size="xs" color="primary" />
            </Button>
          </Tooltip>
        </Box>
      )}
    </Flex>
  );
}
