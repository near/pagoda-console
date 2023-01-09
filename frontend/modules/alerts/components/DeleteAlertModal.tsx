import type { Api } from '@pc/common/types/api';
import { useState } from 'react';

import { Text } from '@/components/lib/Text';
import { ConfirmModal } from '@/components/modals/ConfirmModal';
import { useApiMutation } from '@/hooks/api-mutation';
import analytics from '@/utils/analytics';
import { handleMutationError } from '@/utils/error-handlers';

type Alert = Api.Query.Output<'/alerts/listAlerts'>[number];

interface Props {
  alert: Alert;
  show: boolean;
  setShow: (show: boolean) => void;
  onDelete: () => void;
}

export function DeleteAlertModal({ alert, show, setShow, onDelete }: Props) {
  const [errorText, setErrorText] = useState<string | undefined>();

  function onConfirm() {
    deleteAlertMutation.mutate({
      id: alert.id,
    });
  }

  const deleteAlertMutation = useApiMutation('/alerts/deleteAlert', {
    onMutate: () => {
      setErrorText('');
    },

    onSuccess: (result, variables) => {
      analytics.track('DC Remove Alert', {
        status: 'success',
        name: variables.id,
      });

      onDelete();
      setShow(false);
    },

    onError: (error) => {
      setErrorText('Failed to delete alert.');
      handleMutationError({
        error,
        eventLabel: 'DC Remove Alert',
      });
    },
  });

  return (
    <ConfirmModal
      confirmColor="danger"
      confirmText="Delete"
      errorText={errorText}
      isProcessing={deleteAlertMutation.isLoading}
      onConfirm={onConfirm}
      resetError={() => setErrorText('')}
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
