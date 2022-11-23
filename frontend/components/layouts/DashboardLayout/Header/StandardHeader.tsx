import { useRouter } from 'next/router';
import { useRef, useState } from 'react';

import { ProjectSelector } from '@/components/layouts/DashboardLayout/ProjectSelector';
import { Flex } from '@/components/lib/Flex';
import { Text } from '@/components/lib/Text';
import { ConfirmModal } from '@/components/modals/ConfirmModal';

import { EnvironmentSelector } from '../EnvironmentSelector';
import type { HeaderRedirect } from './types';

interface Props {
  redirect?: HeaderRedirect;
}

export function StandardHeader({ redirect }: Props) {
  const router = useRouter();
  const [redirectMessage, setRedirectMessage] = useState('');
  const redirectOnConfirmRef = useRef<() => void>();
  const [showRedirectConfirmModal, setShowRedirectConfirmModal] = useState(false);

  function onRedirectConfirm() {
    if (redirectOnConfirmRef.current) redirectOnConfirmRef.current();
    setShowRedirectConfirmModal(false);
    router.push(redirect!.url);
  }

  function openConfirmRedirectModal(message: string, onConfirm: () => void) {
    setRedirectMessage(message);
    redirectOnConfirmRef.current = onConfirm;
    setShowRedirectConfirmModal(true);
  }

  return (
    <>
      <Flex align="stretch">
        <ProjectSelector
          onChange={
            redirect?.projectChange
              ? (callback) => {
                  openConfirmRedirectModal(
                    'Changing projects will redirect you away from your current page. Would you like to change?',
                    callback,
                  );
                }
              : (callback) => callback()
          }
        />

        <EnvironmentSelector
          onChange={
            redirect?.environmentChange
              ? (callback) => {
                  openConfirmRedirectModal(
                    'Changing environments will redirect you away from your current page. Would you like to change?',
                    callback,
                  );
                }
              : (callback) => callback()
          }
        />
      </Flex>

      <ConfirmModal
        onConfirm={onRedirectConfirm}
        setShow={setShowRedirectConfirmModal}
        show={showRedirectConfirmModal}
        title="Redirect Notice"
      >
        <Text>{redirectMessage}</Text>
      </ConfirmModal>
    </>
  );
}
