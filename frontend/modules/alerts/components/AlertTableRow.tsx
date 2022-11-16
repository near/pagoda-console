import type { Api } from '@pc/common/types/api';
import { useState } from 'react';

import { Badge } from '@/components/lib/Badge';
import { Button } from '@/components/lib/Button';
import { FeatherIcon } from '@/components/lib/FeatherIcon';
import * as Table from '@/components/lib/Table';
import { Text } from '@/components/lib/Text';
import { TextOverflow } from '@/components/lib/TextOverflow';
import { Tooltip } from '@/components/lib/Tooltip';
import { StableId } from '@/utils/stable-ids';

import { alertTypes } from '../utils/constants';
import { DeleteAlertModal } from './DeleteAlertModal';

type Alert = Api.Query.Output<'/alerts/listAlerts'>[number];

export function AlertTableRow({ alert, onDelete }: { alert: Alert; onDelete: () => void }) {
  const alertType = alertTypes[alert.rule.type];
  const url = `/alerts/edit-alert/${alert.id}`;
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  return (
    <>
      <Table.Row>
        <Table.Cell href={url}>
          <FeatherIcon icon={alertType.icon} color="primary" size="m" />
        </Table.Cell>

        <Table.Cell href={url} wrap css={{ width: '100%' }}>
          <Text color="text1" css={{ minWidth: 0 }}>
            <TextOverflow>{alert.name}</TextOverflow>
          </Text>
        </Table.Cell>

        <Table.Cell href={url}>
          <Badge size="s" css={{ marginLeft: 'auto' }}>
            {alertType.name}
          </Badge>
        </Table.Cell>

        <Table.Cell href={url}>
          {alert.isPaused ? (
            <Badge size="s">
              <FeatherIcon icon="pause" size="xs" /> Paused
            </Badge>
          ) : (
            <Badge size="s">
              <FeatherIcon icon="bell" size="xs" /> Active
            </Badge>
          )}
        </Table.Cell>
        <Table.Cell>
          <Tooltip content="Delete this alert">
            <Button
              stableId={StableId.ALERT_TABLE_ROW_OPEN_DELETE_MODAL_BUTTON}
              size="s"
              aria-label="Delete Alert"
              color="neutral"
              onClick={() => setShowDeleteModal(true)}
            >
              <FeatherIcon icon="trash-2" size="xs" />
            </Button>
          </Tooltip>
        </Table.Cell>
      </Table.Row>

      <DeleteAlertModal alert={alert} show={showDeleteModal} setShow={setShowDeleteModal} onDelete={onDelete} />
    </>
  );
}
