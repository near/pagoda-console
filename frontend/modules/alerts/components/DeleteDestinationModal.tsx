import { useState } from 'react';

import { Text } from '@/components/lib/Text';
import { ConfirmModal } from '@/components/modals/ConfirmModal';

import { deleteDestination } from '../hooks/destinations';
import type { Destination } from '../utils/types';

interface Props {
  destination: Destination;
  show: boolean;
  setShow: (show: boolean) => void;
  onDelete: () => void;
}

export function DeleteDestinationModal({ destination, show, setShow, onDelete }: Props) {
  const [errorText, setErrorText] = useState<string | undefined>();
  const [isDeleting, setIsDeleting] = useState(false);

  async function onConfirm() {
    setIsDeleting(true);
    setErrorText('');

    const success = await deleteDestination(destination);

    if (success) {
      onDelete();
      setShow(false);
    } else {
      setErrorText('Something went wrong.');
      setIsDeleting(false);
    }
  }

  return (
    <ConfirmModal
      confirmColor="danger"
      confirmText="Delete"
      errorText={errorText}
      isProcessing={isDeleting}
      onConfirm={onConfirm}
      setErrorText={setErrorText}
      setShow={setShow}
      show={show}
      title={`Delete Destination`}
    >
      <Text>This action cannot be undone. Are you sure you want to delete the following destination?</Text>
      <Text color="text1" weight="semibold">
        {destination.name}
      </Text>
    </ConfirmModal>
  );
}
