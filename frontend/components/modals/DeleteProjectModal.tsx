import { useState } from 'react';
import { deleteProject } from '../../utils/fetchers';
import { useIdentity } from '../../utils/hooks';
import CenterModal from './CenterModal';

export default function DeleteProjectModal({
  slug,
  name,
  show,
  setShow,
  onDelete,
}: {
  slug: string;
  name: string;
  show: boolean;
  setShow: (show: boolean) => void;
  onDelete: () => void;
}) {
  let identity = useIdentity();
  let [errorText, setErrorText] = useState<string | undefined>();
  let [confirmDisabled, setConfirmDisabled] = useState(false);
  const warning =
    'Removing this project may have unintended consequences, make sure the API keys for this project are no longer in use before removing it.';

  async function onConfirm() {
    setConfirmDisabled(true);
    const success = await deleteProject(identity?.uid || null, slug, name);
    if (success) {
      onDelete();
    } else {
      setErrorText('Something went wrong');
      setConfirmDisabled(false);
    }
  }
  return (
    <CenterModal
      show={show}
      title={`Remove ${name}`}
      content={warning}
      onConfirm={onConfirm}
      confirmDisabled={confirmDisabled}
      confirmText="Remove"
      onHide={() => setShow(false)}
      errorText={errorText}
    />
  );
}
