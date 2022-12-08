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
import { useCurrentEnvironment } from '@/hooks/environments';
import { usePublicMode } from '@/hooks/public';
import { StableId } from '@/utils/stable-ids';

export function PublicHeader() {
  const { authStatus } = useAuth();
  const { environment } = useCurrentEnvironment();
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
    <Flex gap="none" autoWidth stack>
      <Text size="bodySmall" color="text3" css={{ whiteSpace: 'nowrap' }}>
        Viewing contracts on:
      </Text>

      <Flex align="center" gap="xs" autoWidth>
        <SubnetIcon net={environment?.net} size="xs" />
        <Text family="code" color="text1" weight="semibold" size="bodySmall">
          {environment?.name}
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
