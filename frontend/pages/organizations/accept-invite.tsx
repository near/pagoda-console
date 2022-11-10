import { useRouter } from 'next/router';
import { useCallback, useEffect, useRef } from 'react';

import { Button } from '@/components/lib/Button';
import { Flex } from '@/components/lib/Flex';
import { Message } from '@/components/lib/Message';
import { Spinner } from '@/components/lib/Spinner';
import { useOrganizationsLayout } from '@/hooks/layouts';
import type { ParsedError } from '@/hooks/organizations';
import { useAcceptOrgInvite } from '@/hooks/organizations';
import { useIdentity } from '@/hooks/user';
import { StableId } from '@/utils/stable-ids';
import type { NextPageWithLayout } from '@/utils/types';

const AcceptOrgInvite: NextPageWithLayout = () => {
  const router = useRouter();
  const acceptMutation = useAcceptOrgInvite();
  const user = useIdentity();
  const queryToken = router.query.token;
  const token = Array.isArray(queryToken) ? queryToken[0] : queryToken;
  const hasSentRequest = useRef(false);

  const acceptInvite = useCallback(() => {
    if (!token) {
      return;
    }
    acceptMutation.mutate({ token });
  }, [acceptMutation, token]);

  useEffect(() => {
    if (user && !hasSentRequest.current) {
      acceptInvite();
      hasSentRequest.current = true;
    } else if (token) {
      sessionStorage.setItem('signInRedirectUrl', router.asPath);
    }
  }, [router, user, acceptInvite, token]);

  const toProjects = useCallback(() => router.replace('/projects'), [router]);

  if (acceptMutation.status === 'error' || acceptMutation.status === 'success') {
    return (
      <Flex align="center" justify="center" stack css={{ height: '100%' }}>
        {acceptMutation.status === 'error' ? (
          <Message type="error" content={(acceptMutation.error as ParsedError).message} css={{ width: 'initial' }} />
        ) : (
          <Message type="success" content="Invite successfully accepted." css={{ width: 'initial' }} />
        )}
        <Button stableId={StableId.ACCEPT_ORGANIZATION_INVITE_PROJECTS_BUTTON} onClick={toProjects}>
          Take me to projects
        </Button>
      </Flex>
    );
  }
  return <Spinner center />;
};

AcceptOrgInvite.getLayout = useOrganizationsLayout;

export default AcceptOrgInvite;
