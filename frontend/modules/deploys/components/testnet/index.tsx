import { styled } from '@stitches/react';
import { DateTime } from 'luxon';
import { useRouter } from 'next/router';

import { Badge } from '@/components/lib/Badge';
import { Box } from '@/components/lib/Box';
import { Button } from '@/components/lib/Button';
import { Card } from '@/components/lib/Card';
import * as DropdownMenu from '@/components/lib/DropdownMenu';
import { FeatherIcon } from '@/components/lib/FeatherIcon';
import { Flex } from '@/components/lib/Flex';
import { HR } from '@/components/lib/HorizontalRule';
import { Text } from '@/components/lib/Text';
import { useContracts, usePublicOrPrivateContracts } from '@/hooks/contracts';
import { useDeployments, useRepositories } from '@/hooks/deploys';
import { useCurrentEnvironment } from '@/hooks/environments';
import { useSelectedProject } from '@/hooks/selected-project';
import { StableId } from '@/utils/stable-ids';

const MainCard = styled(Card, {
  overflow: 'hidden',
});

export const wasmDeployCompleted = (deploy) =>
  deploy && deploy.contractDeployments.every(({ status }) => status === 'SUCCESS');

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

const FrontendDeployment = ({ deployment }) => {
  const display =
    deployment.frontendDeployConfig.packageName || deployment.cid || new URL(deployment.url as string).hostname;
  const link = deployment.cid ? `https://${deployment.cid}.ipfs.w3s.link` : (deployment.url as string);
  return (
    <Button
      stableId={StableId.DEPLOYS_TESTNET_REPO}
      size="s"
      color="neutral"
      key={deployment.slug}
      onClick={() => window.open(link, '_blank')}
    >
      <FeatherIcon size="xs" icon="external-link" /> {display}
    </Button>
  );
};

const Testnet = () => {
  const project = useSelectedProject();
  const { repositories } = useRepositories(project.project?.slug);
  const { deployments = [] } = useDeployments(project.project?.slug);
  const { environment } = useCurrentEnvironment();
  const { contracts: privateContracts } = useContracts(project.project?.slug, environment?.subId);
  const { contracts } = usePublicOrPrivateContracts(privateContracts);
  const router = useRouter();

  // TODO add better loading state
  if (!repositories || !repositories.length) {
    return (
      <Flex align="center">
        <MainCard borderRadius="m" padding="none">
          <Box padding="m" background="surface3"></Box>
        </MainCard>
      </Flex>
    );
  }

  const repo = repositories[0];
  const lastDeploy: any = deployments.length && {
    ...deployments[0],
    frontendDeployments:
      deployments.find(({ frontendDeployments }) => frontendDeployments.length)?.frontendDeployments || [],
    contractDeployments:
      deployments.find(({ contractDeployments }) => contractDeployments.length)?.contractDeployments || [],
  };
  const accountId = repo.contractDeployConfigs[0]?.nearAccountId;
  const { frontendDeployments = [] } = lastDeploy || {};

  const contractSlug = contracts?.find(({ address }) => address === accountId)?.slug;

  return (
    <Flex align="center" style={{ width: '35rem' }}>
      <MainCard borderRadius="m" padding="none">
        {wasmDeployCompleted(lastDeploy) ? (
          <Box padding="m" background="surface3">
            <Flex align="center">
              <Flex>
                <Text size="h5" color="text1">
                  {repo.githubRepoFullName}
                </Text>
              </Flex>
              <Flex justify="end">
                <Badge
                  size="s"
                  gap="xs"
                  style={{ cursor: 'pointer' }}
                  onClick={() =>
                    window.open(
                      `https://www.github.com/${repo.githubRepoFullName}/commit/${lastDeploy.commitHash}`,
                      '_blank',
                    )
                  }
                >
                  {/* <Text size="bodySmall" color="text1">
                      dev
                    </Text>
                    <Text size="bodySmall" color="text3">
                      @
                    </Text> */}
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
              {frontendDeployments[0] ? <FrontendDeployment deployment={frontendDeployments[0]} /> : null}
              {frontendDeployments.length > 1 ? (
                <DropdownMenu.Root>
                  <DropdownMenu.Button stableId={StableId.PROJECT_SELECTOR_DROPDOWN} color="neutral" size="s">
                    <Text
                      as="span"
                      color="text1"
                      family="body"
                      weight="semibold"
                      css={{
                        '@tablet': {
                          display: 'none',
                        },
                      }}
                    >
                      + {frontendDeployments.length - 1}
                    </Text>
                  </DropdownMenu.Button>
                  <DropdownMenu.Content align="end">
                    {frontendDeployments.map((deployment, i) =>
                      i === 0 ? null : (
                        <div key={deployment.slug} style={{ marginBottom: 10 }}>
                          <FrontendDeployment deployment={deployment} />
                        </div>
                      ),
                    )}
                  </DropdownMenu.Content>
                </DropdownMenu.Root>
              ) : null}
            </FlexTop>
            <BadgeTop background="dark">
              <FeatherIcon size="xs" icon="zap" />
              <Text size="bodySmall" color="text1" family="number">
                {accountId}
              </Text>
              <CopyButton style={{ cursor: 'pointer' }} onClick={() => navigator.clipboard.writeText(accountId)}>
                <FeatherIcon size="xs" icon="copy" />
              </CopyButton>
            </BadgeTop>
          </Box>
        ) : (
          <Card borderRadius="m" padding="m">
            {lastDeploy?.contractDeployments?.some(({ status }) => status === 'ERROR')
              ? 'Deployment Failed'
              : 'Deployment In Progress...'}
          </Card>
        )}
        {wasmDeployCompleted(lastDeploy) ? (
          <>
            <HR color="warning" />
            <Box padding="m">
              <Flex justify="end">
                {/* <Button stableId={StableId.DEPLOYS_TESTNET_ALERTS} size="s" color="neutral">
                    <FeatherIcon size="xs" icon="bell" /> Alerts
                  </Button> */}

                <Button
                  stableId={StableId.DEPLOYS_TESTNET_INTERACT}
                  size="s"
                  color="neutral"
                  onClick={() => router.push(`/contracts/${contractSlug}?tab=interact`)}
                >
                  <FeatherIcon size="xs" icon="terminal" /> Interact
                </Button>

                {/* <Button stableId={StableId.DEPLOYS_TESTNET_MORE} size="s" color="neutral">
                    <FeatherIcon size="xs" icon="more-vertical" />
                  </Button> */}
              </Flex>
            </Box>
          </>
        ) : null}
      </MainCard>
    </Flex>
  );
};

export default Testnet;
