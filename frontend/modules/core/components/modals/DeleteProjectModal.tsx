import { Text } from '@/components/lib/Text';
import { openToast } from '@/components/lib/Toast';
import { ConfirmModal } from '@/components/modals/ConfirmModal';
import { useApiMutation } from '@/hooks/api-mutation';
import analytics from '@/utils/analytics';
import { handleMutationError } from '@/utils/error-handlers';

interface Props {
  slug: string;
  name: string;
  show: boolean;
  setShow: (show: boolean) => void;
  onDelete: () => void;
}

export default function DeleteProjectModal({ slug, name, show, setShow, onDelete }: Props) {
  const deleteProjectMutation = useApiMutation('/projects/delete', {
    onSuccess: () => {
      openToast({
        type: 'success',
        title: 'Project Removed',
        description: name,
      });

      analytics.track('DC Remove Project', {
        status: 'success',
        name,
      });

      onDelete();
    },
    onError: (error) => {
      handleMutationError({
        error,
        eventLabel: 'DC Remove Project',
        eventData: {
          name,
        },
        toastTitle: 'Failed to remove project.',
      });
    },
  });

  function onConfirm() {
    deleteProjectMutation.mutate({ slug });
  }

  return (
    <ConfirmModal
      confirmColor="danger"
      confirmText="Remove"
      errorText={deleteProjectMutation.status === 'error' ? 'Something went wrong' : undefined}
      isProcessing={deleteProjectMutation.isLoading}
      onConfirm={onConfirm}
      resetError={deleteProjectMutation.reset}
      setShow={setShow}
      show={show}
      title={`Remove ${name}`}
    >
      <Text>
        Removing this project may have unintended consequences, make sure the API keys for this project are no longer in
        use before removing it.
      </Text>
    </ConfirmModal>
  );
}
