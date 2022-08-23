import Link from 'next/link';
import { useState } from 'react';

import { Badge } from '@/components/lib/Badge';
import { Button } from '@/components/lib/Button';
import { Card } from '@/components/lib/Card';
import { FeatherIcon } from '@/components/lib/FeatherIcon';
import { Flex } from '@/components/lib/Flex';
import { Text } from '@/components/lib/Text';
import { TextOverflow } from '@/components/lib/TextOverflow';
import { Tooltip } from '@/components/lib/Tooltip';

import { alertTypes } from '../utils/constants';
import type { Alert } from '../utils/types';
import { DeleteAlertModal } from './DeleteAlertModal';

export function AlertCard({ alert, onDelete }: { alert: Alert; onDelete: () => void }) {
  const alertType = alertTypes[alert.type];
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  return (
    <Card as="a" padding="s" borderRadius="m">
      <Flex align="center">
        <Link href={`/alerts/edit-alert/${alert.id}`} passHref key={alert.id}>
          <Card as="a" clickable padding="m" borderRadius="m">
            <Flex align="center">
              <FeatherIcon icon={alertType.icon} color="primary" size="m" />
              <Text color="text1" css={{ minWidth: 0 }}>
                <TextOverflow>{alert.name}</TextOverflow>
              </Text>
              <Badge size="s" css={{ marginLeft: 'auto' }}>
                {alertType.name}
              </Badge>
              {alert.isPaused ? (
                <Badge size="s">
                  <FeatherIcon icon="pause" size="xs" /> Paused
                </Badge>
              ) : (
                <Badge size="s">
                  <FeatherIcon icon="bell" size="xs" /> Active
                </Badge>
              )}
            </Flex>
          </Card>
        </Link>
        <Tooltip content="Delete this alert">
          <Button size="s" aria-label="Delete Alert" color="danger" onClick={() => setShowDeleteModal(true)}>
            <FeatherIcon icon="trash-2" size="xs" />
          </Button>
        </Tooltip>
        <DeleteAlertModal alert={alert} show={showDeleteModal} setShow={setShowDeleteModal} onDelete={onDelete} />
      </Flex>
    </Card>
  );
}
