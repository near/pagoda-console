import { useState } from 'react';

import { Button } from '@/components/lib/Button';
import * as Dialog from '@/components/lib/Dialog';
import { FeatherIcon } from '@/components/lib/FeatherIcon';
import { Flex } from '@/components/lib/Flex';
import { H5 } from '@/components/lib/Heading';
import { HR } from '@/components/lib/HorizontalRule';
import { Text } from '@/components/lib/Text';

import { useDestinations } from '../hooks/destinations';
import { destinationTypes } from '../utils/constants';
import type { Destination } from '../utils/types';
import { DeleteDestinationModal } from './DeleteDestinationModal';
import { WebhookDestinationSecret } from './WebhookDestinationSecret';

interface Props {
  destination: Destination;
  show: boolean;
  setShow: (show: boolean) => void;
}

export function EditDestinationModal(props: Props) {
  return (
    <Dialog.Root open={props.show} onOpenChange={props.setShow}>
      <Dialog.Content title="Destination" size="m">
        {/* The modal content is broken out in to its own component so
        that we'll have a fresh instance each time this modal opens.
        Otherwise, we'd have to worry about manually resetting the state
        and form each time it opened or closed. */}

        <ModalContent {...props} />
      </Dialog.Content>
    </Dialog.Root>
  );
}

function ModalContent(props: Props) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const destinationType = destinationTypes[props.destination.type];
  const { mutate } = useDestinations(props.destination.projectSlug);

  function onDelete() {
    mutate((data) => {
      return data?.filter((d) => d.id !== props.destination.id);
    });

    props.setShow(false);
  }

  return (
    <>
      <Flex stack gap="l">
        <Flex justify="spaceBetween" align="center">
          <Flex align="center">
            <FeatherIcon icon={destinationType.icon} color="primary" size="l" />
            <Flex stack gap="none">
              <H5>{props.destination.name}</H5>
              <Text>{destinationType.name}</Text>
            </Flex>
          </Flex>

          <Button size="s" aria-label="Delete Alert" color="danger" onClick={() => setShowDeleteModal(true)}>
            <FeatherIcon icon="trash-2" size="xs" />
          </Button>
        </Flex>

        <WebhookDestinationForm {...props} />
      </Flex>

      <DeleteDestinationModal
        destination={props.destination}
        onDelete={onDelete}
        show={showDeleteModal}
        setShow={setShowDeleteModal}
      />
    </>
  );
}

function WebhookDestinationForm({ destination }: Props) {
  if (destination.type !== 'WEBHOOK') return null;

  return (
    <Flex stack gap="l">
      <Text color="text1" family="number">
        {destination.config.url}
      </Text>

      <HR />

      <WebhookDestinationSecret destination={destination} />
    </Flex>
  );
}
