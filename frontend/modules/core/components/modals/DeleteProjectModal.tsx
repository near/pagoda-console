import { useState } from 'react';

import { Text } from '@/components/lib/Text';
import { ConfirmModal } from '@/components/modals/ConfirmModal';
import { useAuth } from '@/hooks/auth';
import { deleteProject } from '@/hooks/projects';

interface Props {
  slug: string;
  name: string;
  show: boolean;
  setShow: (show: boolean) => void;
  onDelete: () => void;
}

export default function DeleteProjectModal({ slug, name, show, setShow, onDelete }: Props) {
  const { identity } = useAuth();
  const [errorText, setErrorText] = useState<string | undefined>();
  const [isDeleting, setIsDeleting] = useState(false);

  async function onConfirm() {
    setIsDeleting(true);
    setErrorText('');

    const success = await deleteProject(identity?.uid, slug, name);

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
      confirmText="Remove"
      errorText={errorText}
      isProcessing={isDeleting}
      onConfirm={onConfirm}
      setErrorText={setErrorText}
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
