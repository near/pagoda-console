import type { Api } from '@pc/common/types/api';
import { useState } from 'react';

import { Badge } from '@/components/lib/Badge';
import { Button } from '@/components/lib/Button';
import { FeatherIcon } from '@/components/lib/FeatherIcon';
import { Flex } from '@/components/lib/Flex';
import * as Table from '@/components/lib/Table';
import { Text } from '@/components/lib/Text';
import { TextOverflow } from '@/components/lib/TextOverflow';
import { Tooltip } from '@/components/lib/Tooltip';
import { StableId } from '@/utils/stable-ids';

import { destinationTypes } from '../utils/constants';
import { DeleteDestinationModal } from './DeleteDestinationModal';

type Destination = Api.Query.Output<'/alerts/listDestinations'>[number];

export function DestinationTableRow({
  destination,
  onClick,
  onDelete,
}: {
  destination: Destination;
  onClick: () => void;
  onDelete: () => void;
}) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const destinationType = destinationTypes[destination.type];

  return (
    <>
      <Table.Row>
        <Table.Cell clickable onClick={onClick}>
          <FeatherIcon icon={destinationType.icon} color="primary" size="m" />
        </Table.Cell>

        <Table.Cell clickable onClick={onClick} wrap css={{ width: '100%' }}>
          <Flex stack gap="none" css={{ minWidth: 0 }}>
            <Text color="text1" css={{ width: '100%' }}>
              <TextOverflow>{destination.name}</TextOverflow>
            </Text>
            <Text family="code" size="bodySmall" css={{ width: '100%' }}>
              <TextOverflow>
                {destination.type === 'TELEGRAM' && destination.config.chatTitle}
                {destination.type === 'WEBHOOK' && destination.config.url}
                {destination.type === 'EMAIL' && destination.config.email}
              </TextOverflow>
            </Text>
          </Flex>
        </Table.Cell>

        <Table.Cell clickable onClick={onClick}>
          <Badge size="s" css={{ marginLeft: 'auto' }}>
            {destinationType.name}
          </Badge>
        </Table.Cell>

        <Table.Cell clickable onClick={onClick}>
          {!destination.isValid && (
            <Badge size="s" color="warning">
              <FeatherIcon icon="alert-triangle" size="xs" />
              Needs Action
            </Badge>
          )}
        </Table.Cell>

        <Table.Cell>
          <Tooltip content="Delete this destination">
            <Button
              stableId={StableId.DESTINATIONS_TABLE_ROW_OPEN_DELETE_MODAL_BUTTON}
              size="s"
              aria-label="Delete Destination"
              color="neutral"
              onClick={() => setShowDeleteModal(true)}
            >
              <FeatherIcon icon="trash-2" size="xs" />
            </Button>
          </Tooltip>
        </Table.Cell>
      </Table.Row>

      <DeleteDestinationModal
        destination={destination}
        show={showDeleteModal}
        setShow={setShowDeleteModal}
        onDelete={onDelete}
      />
    </>
  );
}
