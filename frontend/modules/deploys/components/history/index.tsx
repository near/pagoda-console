import { Button } from '@/components/lib/Button';
import { FeatherIcon } from '@/components/lib/FeatherIcon';
import { Flex } from '@/components/lib/Flex';
import { H5 } from '@/components/lib/Heading';
import * as Table from '@/components/lib/Table';
import { StableId } from '@/utils/stable-ids';

const History = () => {
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
    </Table.Root>
  );
};

export default History;
