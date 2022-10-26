import type { ComponentProps } from '@stitches/react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useRef, useState } from 'react';

import { ProjectSelector } from '@/components/layouts/DashboardLayout/ProjectSelector';
import { Flex } from '@/components/lib/Flex';
import { SubnetIcon } from '@/components/lib/SubnetIcon';
import { Text } from '@/components/lib/Text';
import { TextLink } from '@/components/lib/TextLink';
import { UserFullDropdown } from '@/components/lib/UserFullDropdown';
import { ConfirmModal } from '@/components/modals/ConfirmModal';
import { useAuth } from '@/hooks/auth';
import { usePublicEnvironment, usePublicModeIsActive } from '@/hooks/public';
import { StableId } from '@/utils/stable-ids';

import { EnvironmentSelector } from '../EnvironmentSelector';
import * as S from './styles';

type Props = ComponentProps<typeof S.Header> & {
  redirect?: {
    environmentChange?: boolean;
    projectChange?: boolean;
    url: string;
  };
};

export function Header({ redirect, ...props }: Props) {
  const { authStatus } = useAuth();
  const { publicEnvironment } = usePublicEnvironment();
  const { publicModeIsActive } = usePublicModeIsActive();
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
      <S.Header {...props}>
        {publicModeIsActive ? (
          <Flex align="center" gap="s">
            <Text size="bodySmall" color="text3" css={{ whiteSpace: 'nowrap' }}>
              Viewing contracts on:
            </Text>
            <Flex align="center" gap="xs">
              <SubnetIcon net={publicEnvironment.net} size="xs" />
              <Text family="code" color="text1" weight="semibold" size="bodySmall">
                {publicEnvironment.name}
              </Text>
            </Flex>
          </Flex>
        ) : (
          <Flex align="stretch">
            <ProjectSelector
              onBeforeChange={
                redirect?.projectChange
                  ? (change) => {
                      openConfirmRedirectModal(
                        'Changing projects will redirect you away from your current page. Would you like to change?',
                        change,
                      );
                    }
                  : undefined
              }
            />

            <EnvironmentSelector
              onBeforeChange={
                redirect?.environmentChange
                  ? (change) => {
                      openConfirmRedirectModal(
                        'Changing environments will redirect you away from your current page. Would you like to change?',
                        change,
                      );
                    }
                  : undefined
              }
            />
          </Flex>
        )}

        {authStatus === 'AUTHENTICATED' && <UserFullDropdown />}

        {authStatus === 'UNAUTHENTICATED' && (
          <Link href="/">
            <TextLink stableId={StableId.HEADER_SIGN_IN_LINK} css={{ marginRight: 'var(--space-m)' }}>
              Sign In
            </TextLink>
          </Link>
        )}
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
