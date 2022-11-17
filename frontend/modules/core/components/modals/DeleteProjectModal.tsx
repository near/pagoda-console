import type { Projects } from '@pc/common/types/core';
import { useCallback } from 'react';

import { Text } from '@/components/lib/Text';
import { ConfirmModal } from '@/components/modals/ConfirmModal';
import { useMutation } from '@/hooks/mutation';
import { useQueryCache } from '@/hooks/query-cache';

interface Props {
  slug: Projects.ProjectSlug;
  name: string;
  show: boolean;
  setShow: (show: boolean) => void;
  onDelete?: () => void;
}

export default function DeleteProjectModal({ slug, name, show, setShow, onDelete }: Props) {
  const projectsCache = useQueryCache('/projects/list');
  const deleteProjectMutation = useMutation('/projects/delete', {
    onSuccess: () => {
      projectsCache.update(undefined, (projects) => projects?.filter((project) => project.slug !== slug));
      onDelete?.();
    },
    getAnalyticsSuccessData: () => ({ name }),
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
