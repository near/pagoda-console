import type { Api } from '@pc/common/types/api';
import { useState } from 'react';

import { Text } from '@/components/lib/Text';
import { ConfirmModal } from '@/components/modals/ConfirmModal';
import { deleteAlert } from '@/modules/alerts/hooks/alerts';

type Alert = Api.Query.Output<'/alerts/listAlerts'>[number];

interface Props {
  alert: Alert;
  show: boolean;
  setShow: (show: boolean) => void;
  onDelete: () => void;
}

export function DeleteAlertModal({ alert, show, setShow, onDelete }: Props) {
  const [errorText, setErrorText] = useState<string | undefined>();
  const [isDeleting, setIsDeleting] = useState(false);

  async function onConfirm() {
    setIsDeleting(true);
    setErrorText('');

    const success = await deleteAlert(alert);

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
      title={`Delete Alert`}
    >
      <Text>This action cannot be undone. Are you sure you want to delete the following alert?</Text>
      <Text color="text1" weight="semibold">
        {alert.name}
      </Text>
    </ConfirmModal>
  );
}
