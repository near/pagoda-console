import type { ComponentProps } from '@stitches/react';
import { useRouter } from 'next/router';
import { useRef, useState } from 'react';

import { ProjectSelector } from '@/components/layouts/DashboardLayout/ProjectSelector';
import * as DropdownMenu from '@/components/lib/DropdownMenu';
import { FeatherIcon } from '@/components/lib/FeatherIcon';
import { Flex } from '@/components/lib/Flex';
import { Text } from '@/components/lib/Text';
import { ConfirmModal } from '@/components/modals/ConfirmModal';
import { useAccount } from '@/hooks/user';
import { logOut } from '@/utils/auth';

import { EnvironmentSelector } from '../EnvironmentSelector';
import type { Redirect } from '../types';
import * as S from './styles';

type Props = ComponentProps<typeof S.Header> & {
  redirect?: Redirect;
};

export function Header({ redirect, ...props }: Props) {
  const router = useRouter();
  const { user } = useAccount();
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

  function onSelectLogout() {
    logOut();
  }

  function onSelectUserSettings() {
    router.push('/settings');
  }

  return (
    <>
      <S.Header {...props}>
        <Flex align="center" justify="spaceBetween">
          <Flex align="center">
            <ProjectSelector
              onBeforeChange={
                redirect?.projectChange
                  ? (project, selectProject) => {
                      openConfirmRedirectModal(
                        'Changing projects will redirect you away from your current page. Would you like to change?',
                        () => {
                          selectProject(project);
                        },
                      );
                    }
                  : undefined
              }
            />

            <EnvironmentSelector
              onBeforeChange={
                redirect?.environmentChange
                  ? (environment, selectEnvironment) => {
                      openConfirmRedirectModal(
                        'Changing environments will redirect you away from your current page. Would you like to change?',
                        () => {
                          selectEnvironment(environment);
                        },
                      );
                    }
                  : undefined
              }
            />
          </Flex>

          <DropdownMenu.Root>
            <DropdownMenu.Button color="transparent">
              <FeatherIcon icon="user" />
              <Text as="span" color="text1" family="body" weight="semibold">
                {user?.name}
              </Text>
            </DropdownMenu.Button>

            <DropdownMenu.Content align="end">
              <DropdownMenu.Item onSelect={() => onSelectUserSettings()}>
                <FeatherIcon icon="settings" />
                User Settings
              </DropdownMenu.Item>

              <DropdownMenu.Item onSelect={() => onSelectLogout()}>
                <FeatherIcon icon="log-out" />
                Logout
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        </Flex>
      </S.Header>

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
