import { useRouter } from 'next/router';
import { useCallback, useEffect, useRef } from 'react';

import { Button } from '@/components/lib/Button';
import { Flex } from '@/components/lib/Flex';
import { Message } from '@/components/lib/Message';
import { Spinner } from '@/components/lib/Spinner';
import { useOrganizationsLayout } from '@/hooks/layouts';
import { useMutation } from '@/hooks/mutation';
import type { ParsedError } from '@/hooks/organizations';
import { openUserErrorToast, parseError, UserError } from '@/hooks/organizations';
import { useQueryCache } from '@/hooks/query-cache';
import { useIdentity } from '@/hooks/user';
import { StableId } from '@/utils/stable-ids';
import type { NextPageWithLayout } from '@/utils/types';

const getInviteErrorMessage = (code: UserError) => {
  switch (code) {
    case UserError.ORG_INVITE_BAD_TOKEN:
      return 'This invitation does not exist.';
    case UserError.ORG_INVITE_EMAIL_MISMATCH:
      return 'This invitation belongs to a different email address.';
    case UserError.ORG_INVITE_EXPIRED:
      return 'This invitation has expired.';
    case UserError.BAD_ORG:
      return 'The organization has been deleted.';
    case UserError.ORG_INVITE_ALREADY_MEMBER:
      return 'The user is already a member of the organization.';
  }
};

const AcceptOrgInvite: NextPageWithLayout = () => {
  const router = useRouter();
  const orgsCache = useQueryCache('/users/listOrgs');
  const acceptMutation = useMutation('/users/acceptOrgInvite', {
    onSuccess: () => orgsCache.invalidate(),
    onError: (error) => openUserErrorToast(parseError(error, getInviteErrorMessage)),
  });
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
