import { Badge } from '@/components/lib/Badge';
import { Button } from '@/components/lib/Button';
import { FeatherIcon } from '@/components/lib/FeatherIcon';
import { Flex } from '@/components/lib/Flex';
import { H5 } from '@/components/lib/Heading';
import * as Table from '@/components/lib/Table';
import { Text } from '@/components/lib/Text';
import { StableId } from '@/utils/stable-ids';

const History = () => {
  const history = [1, 2, 3, 4];

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
            <Flex justify="end">
              <Button stableId={StableId.DEPLOYS_HISTORY_FILTER} hideText="tablet" size="s" color="primaryBorder">
                <FeatherIcon size="xs" icon="sliders" /> Filter
              </Button>
            </Flex>
          </Table.HeaderCell>
        </Table.Row>
      </Table.Head>
      <Table.Head>
        <Table.Row>
          <Table.HeaderCell>COMMIT</Table.HeaderCell>
          <Table.HeaderCell>DATE</Table.HeaderCell>
          <Table.HeaderCell>ENVIROMENT</Table.HeaderCell>
          <Table.HeaderCell>MESSAGE</Table.HeaderCell>
          <Table.HeaderCell></Table.HeaderCell>
        </Table.Row>
      </Table.Head>

      <Table.Body>
        {history.map((i) => (
          <Table.Row key={i}>
            <Table.Cell>
              <Flex gap="xs">
                <Text size="bodySmall" color="text1">
                  dev
                </Text>
                <Text size="bodySmall" color="text3">
                  @
                </Text>
                <Text size="bodySmall" color="primary" family="number">
                  4166bf9
                </Text>
              </Flex>
            </Table.Cell>
            <Table.Cell>
              <Text size="bodySmall" family="number" color="text1">
                Today at 4:35 PM
              </Text>
            </Table.Cell>
            <Table.Cell>
              <Text size="bodySmall" family="number" color="text2">
                <Badge size="s">
                  <FeatherIcon size="xs" icon="code" color="warning" />
                  Testnet
                </Badge>{' '}
                1m 58s
              </Text>
            </Table.Cell>
            <Table.Cell>
              <Text size="bodySmall" color="text1">
                Fixed deployment flow
              </Text>
            </Table.Cell>
            <Table.Cell>
              <Flex justify="end">
                <Button stableId={StableId.DEPLOYS_HISTORY_RECORD} hideText="tablet" size="s" color="neutral">
                  <FeatherIcon size="xs" icon="zap" />
                </Button>
              </Flex>
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  );
};

export default History;
