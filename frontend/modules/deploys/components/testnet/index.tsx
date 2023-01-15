import { styled } from '@stitches/react';
import { DateTime } from 'luxon';

import { Badge } from '@/components/lib/Badge';
import { Box } from '@/components/lib/Box';
import { Button } from '@/components/lib/Button';
import { Card } from '@/components/lib/Card';
import { FeatherIcon } from '@/components/lib/FeatherIcon';
import { Flex } from '@/components/lib/Flex';
import { HR } from '@/components/lib/HorizontalRule';
import { Text } from '@/components/lib/Text';
import { useRepositories } from '@/hooks/deploys';
import { useSelectedProject } from '@/hooks/selected-project';
import { StableId } from '@/utils/stable-ids';

const MainCard = styled(Card, {
  overflow: 'hidden',
});

const FlexTop = styled(Flex, {
  margin: 'var(--space-s) 0 0 0',
});

const BadgeTop = styled(Badge, {
  margin: 'var(--space-s) 0 0 0',
});

const CopyButton = styled(Flex, {
  background: 'var(--color-surface-5)',
  padding: 'var(--space-xs)',
  borderRadius: 'var(--border-radius-xs)',
});

const Testnet = () => {
  const project = useSelectedProject();
  const { repositories } = useRepositories(project.project?.slug, project.environment?.subId);

  // TODO if there are no repositories, should the deploys tab be hidden or disabled in the nav?
  // TODO add better loading state
  if (!repositories) {
    return null;
  }

  const repo = repositories[0];
  const lastDeploy = repo.repoDeployments[0];

  return (
    <Flex align="center">
      <MainCard borderRadius="m" padding="none">
        <Box padding="m" background="surface3">
          <Flex align="center">
            <Flex>
              <Text size="h5" color="text1">
                {repo.githubRepoFullName}
              </Text>
            </Flex>
            <Flex justify="end">
              <Badge size="s" gap="xs">
                <Text size="bodySmall" color="text1">
                  dev
                </Text>
                <Text size="bodySmall" color="text3">
                  @
                </Text>
                <Text size="bodySmall" color="primary" family="number">
                  {lastDeploy.commitHash.substring(0, 7)}
                </Text>
              </Badge>
            </Flex>
          </Flex>
          <FlexTop>
            <Text family="number" size="bodySmall" color="text3">
              Last Commit
            </Text>
            <Text family="number" size="bodySmall" color="text2">
              {DateTime.fromISO(lastDeploy.createdAt).toUTC().toLocaleString(DateTime.DATETIME_MED)} GMT
            </Text>
          </FlexTop>
          <FlexTop>
            <Button stableId={StableId.DEPLOYS_TESTNET_REPO} size="s" color="neutral">
              <FeatherIcon size="xs" icon="external-link" /> {lastDeploy.frontendDeployments[0].url}
            </Button>
          </FlexTop>
          <BadgeTop background="dark">
            <FeatherIcon size="xs" icon="zap" />
            <Text size="bodySmall" color="text1" family="number">
              {repo.contractDeployConfigs[0].nearAccountId}
            </Text>
            <CopyButton>
              <FeatherIcon size="xs" icon="copy" />
            </CopyButton>
          </BadgeTop>
        </Box>
        <HR color="warning" />
        <Box padding="m">
          <Flex justify="end">
            <Button stableId={StableId.DEPLOYS_TESTNET_ALERTS} size="s" color="neutral">
              <FeatherIcon size="xs" icon="bell" /> Alerts
            </Button>
            <Button stableId={StableId.DEPLOYS_TESTNET_INTERACT} size="s" color="neutral">
              <FeatherIcon size="xs" icon="terminal" /> Interact
            </Button>
            <Button stableId={StableId.DEPLOYS_TESTNET_MORE} size="s" color="neutral">
              <FeatherIcon size="xs" icon="more-vertical" />
            </Button>
          </Flex>
        </Box>
      </MainCard>
    </Flex>
  );
};

export default Testnet;
