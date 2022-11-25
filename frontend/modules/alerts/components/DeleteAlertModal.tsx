import type { Api } from '@pc/common/types/api';
import { useCallback } from 'react';

import { Text } from '@/components/lib/Text';
import { ConfirmModal } from '@/components/modals/ConfirmModal';
import { useMutation } from '@/hooks/mutation';

type Alert = Api.Query.Output<'/alerts/listAlerts'>[number];

interface Props {
  alert: Alert;
  show: boolean;
  setShow: (show: boolean) => void;
  onDelete: () => void;
}

export function DeleteAlertModal({ alert, show, setShow, onDelete }: Props) {
  const deleteAlertMutation = useMutation('/alerts/deleteAlert', {
    getAnalyticsSuccessData: ({ id }) => ({ id }),
    getAnalyticsErrorData: ({ id }) => ({ id }),
    onSuccess: onDelete,
  });

  const onConfirm = useCallback(() => deleteAlertMutation.mutate({ id: alert.id }), [deleteAlertMutation, alert.id]);

  return (
    <ConfirmModal
      confirmColor="danger"
      confirmText="Delete"
      errorText={deleteAlertMutation.status === 'error' ? 'Something went wrong' : undefined}
      isProcessing={deleteAlertMutation.isLoading}
      onConfirm={onConfirm}
      resetError={deleteAlertMutation.reset}
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
