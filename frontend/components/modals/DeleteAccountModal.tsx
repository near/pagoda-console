import { useState } from 'react';

import { deleteAccount, useIdentity } from '@/hooks/user';

import { Text } from '../lib/Text';
import { ConfirmModal } from './ConfirmModal';

export default function DeleteAccountModal({
  show,
  setShow,
  onDelete,
}: {
  show: boolean;
  setShow: (show: boolean) => void;
  onDelete: () => void;
}) {
  const identity = useIdentity();
  const [errorText, setErrorText] = useState<string | undefined>();
  const [isDeleting, setIsDeleting] = useState(false);

  async function onConfirm() {
    setIsDeleting(true);

    const success = await deleteAccount(identity?.uid);

    if (success) {
      onDelete();
    } else {
      setErrorText('Something went wrong while deleting an account.');
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
      title={`Delete account ${identity?.email}`}
    >
      <Text>Do you really want to delete your account?</Text>
    </ConfirmModal>
  );
}
