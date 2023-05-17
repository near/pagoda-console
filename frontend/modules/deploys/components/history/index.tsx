import { DateTime } from 'luxon';
import { useRouter } from 'next/router';

import { Badge } from '@/components/lib/Badge';
import { Button } from '@/components/lib/Button';
import { FeatherIcon } from '@/components/lib/FeatherIcon';
import { Flex } from '@/components/lib/Flex';
import { H5 } from '@/components/lib/Heading';
import * as Table from '@/components/lib/Table';
import { Text } from '@/components/lib/Text';
import { useDeployments } from '@/hooks/deploys';
import { useSelectedProject } from '@/hooks/selected-project';
import { StableId } from '@/utils/stable-ids';

import { wasmDeployCompleted } from '../testnet';

const History = () => {
  const router = useRouter();
  const { repositorySlug } = router.query;
  const project = useSelectedProject({ enforceSelectedProject: !repositorySlug });
  const { deployments } = useDeployments(project.project?.slug, repositorySlug as string);

  return (
    <Table.Root>
      <Table.Head>
        <Table.Row>
          <Table.HeaderCell textTransform="none">
            <Flex align="center">
              <FeatherIcon color="text1" icon="clock" />
              <H5>Deploy History</H5>
            </Flex>
          </Table.HeaderCell>
          <Table.HeaderCell></Table.HeaderCell>
          <Table.HeaderCell></Table.HeaderCell>
          <Table.HeaderCell></Table.HeaderCell>
          <Table.HeaderCell textTransform="none">
            {/* <Flex justify="end">
              <Button stableId={StableId.DEPLOYS_HISTORY_FILTER} hideText="tablet" size="s" color="primaryBorder">
                <FeatherIcon size="xs" icon="sliders" /> Filter
              </Button>
            </Flex> */}
          </Table.HeaderCell>
        </Table.Row>
      </Table.Head>
      <Table.Head>
        <Table.Row>
          <Table.HeaderCell>COMMIT</Table.HeaderCell>
          <Table.HeaderCell>DATE</Table.HeaderCell>
          <Table.HeaderCell>ENVIRONMENT</Table.HeaderCell>
          <Table.HeaderCell>MESSAGE</Table.HeaderCell>
          <Table.HeaderCell></Table.HeaderCell>
        </Table.Row>
      </Table.Head>

      <Table.Body>
        {deployments?.filter(wasmDeployCompleted).map((deployment) => (
          <Table.Row key={deployment.slug}>
            <Table.Cell>
              <Flex gap="xs">
                {/* <Text size="bodySmall" color="text1">
                  dev
                </Text>
                <Text size="bodySmall" color="text3">
                  @
                </Text> */}
                <Text
                  size="bodySmall"
                  color="primary"
                  family="number"
                  style={{ cursor: 'pointer' }}
                  onClick={() =>
                    window.open(
                      `https://www.github.com/${deployment.githubRepoFullName}/commit/${deployment.commitHash}`,
                      '_blank',
                    )
                  }
                >
                  {deployment.commitHash.substring(0, 7)}
                </Text>
              </Flex>
            </Table.Cell>
            <Table.Cell>
              <Text size="bodySmall" family="number" color="text1">
                {DateTime.fromISO(deployment.createdAt).toUTC().toLocaleString(DateTime.DATETIME_MED_WITH_WEEKDAY)} GMT
              </Text>
            </Table.Cell>
            <Table.Cell>
              <Text size="bodySmall" family="number" color="text2">
                <Badge size="s">
                  <FeatherIcon size="xs" icon="code" color="warning" />
                  Testnet
                </Badge>{' '}
                {/* 1m 58s */}
              </Text>
            </Table.Cell>
            <Table.Cell>
              <Text size="bodySmall" color="text1">
                {deployment.commitMessage}
              </Text>
            </Table.Cell>
            <Table.Cell>
              <Flex justify="end">
                {deployment?.contractDeployments?.[0]?.deployTransactionHash ? (
                  <Button
                    stableId={StableId.DEPLOYS_HISTORY_RECORD}
                    hideText="tablet"
                    size="s"
                    color="neutral"
                    onClick={() =>
                      window.open(
                        `https://explorer.testnet.near.org/transactions/${deployment.contractDeployments[0].deployTransactionHash}`,
                        '_blank',
                      )
                    }
                  >
                    <FeatherIcon size="xs" icon="zap" />
                  </Button>
                ) : null}
              </Flex>
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  );
};

export default History;
