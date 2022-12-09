import type { Api } from '@pc/common/types/api';
import { useCallback } from 'react';
import { mutate } from 'swr';

import { Text } from '@/components/lib/Text';
import { openToast } from '@/components/lib/Toast';
import { ConfirmModal } from '@/components/modals/ConfirmModal';
import { useMutation } from '@/hooks/mutation';
import { useSelectedProject } from '@/hooks/selected-project';

type Alert = Api.Query.Output<'/alerts/listAlerts'>[number];

interface Props {
  alert: Alert;
  show: boolean;
  setShow: (show: boolean) => void;
  onDelete?: () => void;
}

export function DeleteAlertModal({ alert, show, setShow, onDelete }: Props) {
  const { project, environment } = useSelectedProject();
  const deleteAlertMutation = useMutation('/alerts/deleteAlert', {
    getAnalyticsSuccessData: ({ id }) => ({ id }),
    getAnalyticsErrorData: ({ id }) => ({ id }),
    onSuccess: () => {
      const name = alert.name;
      openToast({
        type: 'success',
        title: 'Alert Deleted',
        description: name,
      });
      mutate<Alert[]>(['/alerts/listAlerts', project!.slug, environment!.subId], (alerts) =>
        alerts?.filter((lookupAlert) => lookupAlert.id !== alert.id),
      );
      onDelete?.();
    },
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
