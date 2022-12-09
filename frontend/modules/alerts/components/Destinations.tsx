import type { Api } from '@pc/common/types/api';
import { useCallback, useState } from 'react';

import { Button } from '@/components/lib/Button';
import { FeatherIcon } from '@/components/lib/FeatherIcon';
import { Flex } from '@/components/lib/Flex';
import { H1 } from '@/components/lib/Heading';
import { Spinner } from '@/components/lib/Spinner';
import * as Table from '@/components/lib/Table';
import { Text } from '@/components/lib/Text';
import { useQuery } from '@/hooks/query';
import { useSelectedProject } from '@/hooks/selected-project';
import { EditDestinationModal } from '@/modules/alerts/components/EditDestinationModal';
import { NewDestinationModal } from '@/modules/alerts/components/NewDestinationModal';
import { StableId } from '@/utils/stable-ids';

import { DestinationTableRow } from './DestinationsTableRow';

type Destination = Api.Query.Output<'/alerts/listDestinations'>[number];

export function Destinations() {
  const { project } = useSelectedProject();
  const destinationsQuery = useQuery(['/alerts/listDestinations', { projectSlug: project?.slug ?? 'unknown' }], {
    enabled: Boolean(project),
  });
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

        {destinationsQuery.status === 'loading' ? (
          <Spinner center />
        ) : destinationsQuery.status === 'error' ? null : destinationsQuery.data.length === 0 ? (
          <Text>{`Your selected project doesn't have any destinations configured yet.`}</Text>
        ) : (
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
              {destinationsQuery.data.map((row) => (
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
