import { useState } from 'react';

import { Text } from '@/components/lib/Text';
import { ConfirmModal } from '@/components/modals/ConfirmModal';
import { deleteAccount, useIdentity } from '@/hooks/user';

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
      title={`Delete Account`}
    >
      <Text>
        This action is permanent and can&apos;t be undone. Are you sure you want to delete the following account?
      </Text>
      <Text color="text1">{identity?.email}</Text>
    </ConfirmModal>
  );
}
