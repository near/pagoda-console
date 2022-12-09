import type { Api } from '@pc/common/types/api';
import { useCallback, useState } from 'react';

import { Button } from '@/components/lib/Button';
import { FeatherIcon } from '@/components/lib/FeatherIcon';
import { Flex } from '@/components/lib/Flex';
import { H1 } from '@/components/lib/Heading';
import { Spinner } from '@/components/lib/Spinner';
import * as Table from '@/components/lib/Table';
import { Text } from '@/components/lib/Text';
import { useSelectedProject } from '@/hooks/selected-project';
import { EditDestinationModal } from '@/modules/alerts/components/EditDestinationModal';
import { NewDestinationModal } from '@/modules/alerts/components/NewDestinationModal';
import { useDestinations } from '@/modules/alerts/hooks/destinations';
import { StableId } from '@/utils/stable-ids';

import { DestinationTableRow } from './DestinationsTableRow';

type Destination = Api.Query.Output<'/alerts/listDestinations'>[number];

export function Destinations() {
  const { project } = useSelectedProject();
  const { destinations } = useDestinations(project?.slug);
  const [showNewDestinationModal, setShowNewDestinationModal] = useState(false);
  const [selectedEditDestination, setSelectedEditDestination] = useState<Destination>();
  const resetDestination = useCallback(() => setSelectedEditDestination(undefined), [setSelectedEditDestination]);

  return (
    <>
      <Flex stack gap="l">
        <Flex justify="spaceBetween" align="center">
          <H1>Destinations</H1>
          <Button
            stableId={StableId.DESTINATIONS_OPEN_CREATE_MODAL_BUTTON}
            onClick={() => setShowNewDestinationModal(true)}
            hideText="mobile"
          >
            <FeatherIcon icon="plus" /> New Destination
          </Button>
        </Flex>

        {!destinations && <Spinner center />}

        {destinations?.length === 0 && (
          <Text>{`Your selected project doesn't have any destinations configured yet.`}</Text>
        )}

        {destinations && destinations?.length > 0 && (
          <Table.Root>
            <Table.Head>
              <Table.Row>
                <Table.HeaderCell></Table.HeaderCell>
                <Table.HeaderCell>Name</Table.HeaderCell>
                <Table.HeaderCell>Type</Table.HeaderCell>
                <Table.HeaderCell></Table.HeaderCell>
                <Table.HeaderCell></Table.HeaderCell>
              </Table.Row>
            </Table.Head>

            <Table.Body>
              {destinations.map((row) => (
                <DestinationTableRow destination={row} onClick={() => setSelectedEditDestination(row)} key={row.id} />
              ))}
            </Table.Body>
          </Table.Root>
        )}
      </Flex>
      <NewDestinationModal show={showNewDestinationModal} setShow={setShowNewDestinationModal} />

      {selectedEditDestination && (
        <EditDestinationModal destination={selectedEditDestination} resetDestination={resetDestination} />
      )}
    </>
  );
}
