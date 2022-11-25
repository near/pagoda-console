import type { Api } from '@pc/common/types/api';
import { useCallback, useState } from 'react';

import { Button } from '@/components/lib/Button';
import { FeatherIcon } from '@/components/lib/FeatherIcon';
import { Flex } from '@/components/lib/Flex';
import { H1 } from '@/components/lib/Heading';
import { Spinner } from '@/components/lib/Spinner';
import * as Table from '@/components/lib/Table';
import { Text } from '@/components/lib/Text';
import { useSureProjectContext } from '@/hooks/project-context';
import { useQuery } from '@/hooks/query';
import { EditDestinationModal } from '@/modules/alerts/components/EditDestinationModal';
import { NewDestinationModal } from '@/modules/alerts/components/NewDestinationModal';
import { StableId } from '@/utils/stable-ids';

import { DestinationTableRow } from './DestinationsTableRow';

type Destination = Api.Query.Output<'/alerts/listDestinations'>[number];

export function Destinations() {
  const { projectSlug } = useSureProjectContext();
  const destinationsQuery = useQuery(['/alerts/listDestinations', { projectSlug }]);
  const [showNewDestinationModal, setShowNewDestinationModal] = useState(false);
  const [showEditDestinationModal, setShowEditDestinationModal] = useState(false);
  const [selectedEditDestination, setSelectedEditDestination] = useState<Destination>();

  const openDestination = useCallback((destination: Destination) => {
    setSelectedEditDestination(destination);
    setShowEditDestinationModal(true);
  }, []);

  return (
    <>
      <Flex stack gap="l">
        <Flex justify="spaceBetween">
          <H1>Destinations</H1>
          <Button
            stableId={StableId.DESTINATIONS_OPEN_CREATE_MODAL_BUTTON}
            onClick={() => setShowNewDestinationModal(true)}
          >
            <FeatherIcon icon="plus" /> New Destination
          </Button>
        </Flex>

        {destinationsQuery.status === 'loading' ? (
          <Spinner center />
        ) : destinationsQuery.status === 'error' ? (
          <div>Error loading destinations</div>
        ) : destinationsQuery.data.length === 0 ? (
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
                <DestinationTableRow destination={row} onClick={() => openDestination(row)} key={row.id} />
              ))}
            </Table.Body>
          </Table.Root>
        )}
      </Flex>
      <NewDestinationModal show={showNewDestinationModal} setShow={setShowNewDestinationModal} />

      {selectedEditDestination && (
        <EditDestinationModal
          destination={selectedEditDestination}
          show={showEditDestinationModal}
          setShow={setShowEditDestinationModal}
        />
      )}
    </>
  );
}
