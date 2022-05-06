import { useState } from 'react';

import { ejectTutorial } from '@/utils/fetchers';

import CenterModal from './CenterModal';

export default function EjectProjectModal({
  slug,
  name,
  show,
  setShow,
  onEject,
}: {
  slug: string;
  name: string;
  show: boolean;
  setShow: (show: boolean) => void;
  onEject: () => void;
}) {
  const [errorText, setErrorText] = useState<string | undefined>();
  const [confirmDisabled, setConfirmDisabled] = useState(false);

  const warning =
    'Completing this tutorial will turn it into a full project. Doing so will remove the Tutorial from the menu bar and create a mainnet API key.';

  async function onConfirm() {
    setConfirmDisabled(true);
    const success = await ejectTutorial(slug, name);
    if (success) {
      onEject();
    } else {
      setErrorText('Something went wrong');
      setConfirmDisabled(false);
    }
  }
  return (
    <CenterModal
      show={show}
      title={`Complete ${name}`}
      content={warning}
      onConfirm={onConfirm}
      confirmDisabled={confirmDisabled}
      confirmText="Complete"
      confirmVariant="primary"
      onHide={() => setShow(false)}
      errorText={errorText}
    />
  );
}
