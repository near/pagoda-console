import type { Api } from '@pc/common/types/api';
import type { Projects } from '@pc/common/types/core';
import { useCallback } from 'react';
import { mutate } from 'swr';

import { Text } from '@/components/lib/Text';
import { ConfirmModal } from '@/components/modals/ConfirmModal';
import { useAuth } from '@/hooks/auth';
import { useMutation } from '@/hooks/mutation';

interface Props {
  slug: Projects.ProjectSlug;
  name: string;
  show: boolean;
  setShow: (show: boolean) => void;
  onDelete: () => void;
}

type Projects = Api.Query.Output<'/projects/list'>;

export default function DeleteProjectModal({ slug, name, show, setShow, onDelete }: Props) {
  const { identity } = useAuth();
  const deleteProjectMutation = useMutation('/projects/delete', {
    onSuccess: () => {
      if (identity?.uid) {
        mutate<Projects>(['/projects/list', identity.uid], (projects) => projects?.filter((p) => p.slug !== slug));
      }
      onDelete?.();
    },
    getAnalyticsSuccessData: () => ({ name }),
    getAnalyticsErrorData: () => ({ name }),
  });
  const onConfirm = useCallback(() => deleteProjectMutation.mutate({ slug }), [deleteProjectMutation, slug]);

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
