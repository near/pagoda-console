import type { Api } from '@pc/common/types/api';
import { useState } from 'react';

import { Button } from '@/components/lib/Button';
import { FeatherIcon } from '@/components/lib/FeatherIcon';
import { Flex } from '@/components/lib/Flex';
import { H1 } from '@/components/lib/Heading';
import { Spinner } from '@/components/lib/Spinner';
import * as Table from '@/components/lib/Table';
import { Text } from '@/components/lib/Text';
import { openToast } from '@/components/lib/Toast';
import { EditDestinationModal } from '@/modules/alerts/components/EditDestinationModal';
import { NewDestinationModal } from '@/modules/alerts/components/NewDestinationModal';
import { useDestinations } from '@/modules/alerts/hooks/destinations';
import { StableId } from '@/utils/stable-ids';

import { DestinationTableRow } from './DestinationsTableRow';

type Project = Api.Query.Output<'/projects/getDetails'>;
type Destination = Api.Query.Output<'/alerts/listDestinations'>[number];

export function Destinations({ project }: { project?: Project }) {
  const { destinations, mutate } = useDestinations(project?.slug);
  const [showNewDestinationModal, setShowNewDestinationModal] = useState(false);
  const [showEditDestinationModal, setShowEditDestinationModal] = useState(false);
  const [selectedEditDestination, setSelectedEditDestination] = useState<Destination>();

  function openDestination(destination: Destination) {
    setSelectedEditDestination(destination);
    setShowEditDestinationModal(true);
  }

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
              {!destinations && <Table.PlaceholderRows />}

              {destinations?.map((row) => {
                return (
                  <DestinationTableRow
                    destination={row}
                    onClick={() => openDestination(row)}
                    onDelete={() => {
                      const name = row?.name;

                      openToast({
                        type: 'success',
                        title: 'Destination Deleted',
                        description: name ?? undefined,
                      });

                      mutate(() => {
                        return destinations?.filter((d) => d.id !== row.id);
                      });
                    }}
                    key={row.id}
                  />
                );
              })}
            </Table.Body>
          </Table.Root>
        )}
      </Flex>
      {project && (
        <NewDestinationModal
          projectSlug={project.slug}
          show={showNewDestinationModal}
          setShow={setShowNewDestinationModal}
        />
      )}

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
