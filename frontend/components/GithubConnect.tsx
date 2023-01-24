import { useRouter } from 'next/router';
import type { ReactElement } from 'react';
import { useRef } from 'react';
import { useEffect } from 'react';

import { Flex } from '@/components/lib/Flex';
import { useApiMutation } from '@/hooks/api-mutation';
import { useAuth } from '@/hooks/auth';
import { useGithubConnection } from '@/hooks/github';
import { useRouteParam } from '@/hooks/route';
import analytics from '@/utils/analytics';
import config from '@/utils/config';
import { handleMutationError } from '@/utils/error-handlers';
import { assertUnreachable } from '@/utils/helpers';
import { StableId } from '@/utils/stable-ids';

import { ButtonLink } from './lib/Button';
import { FeatherIcon } from './lib/FeatherIcon';
import { Message } from './lib/Message';
import { Spinner } from './lib/Spinner';
import { Text } from './lib/Text';
import { TextLink } from './lib/TextLink';
import { openToast } from './lib/Toast';

interface Props {
  connected: ReactElement;
  unconnected: ReactElement;
}

export function GithubConnect(props: Props) {
  const { connection, error: connectionError, mutate: refreshConnection } = useGithubConnection();
  const router = useRouter();
  const codeParam = useRouteParam('code');
  const { authStatus } = useAuth();
  const hasCalledConnect = useRef(false);

  const { mutate: connect, ...connectMutation } = useApiMutation('/users/connectGithub', {
    onSuccess: () => {
      refreshConnection(undefined); // Mutating to undefined prevents the "NONE" state from quickly flashing

      openToast({
        type: 'success',
        title: 'GitHub account connected!',
        icon: 'github',
      });

      analytics.track('DC Github Connected', {
        status: 'success',
      });
    },

    onError: (error) => {
      handleMutationError({
        error,
        eventLabel: 'DC Github Connected',
        toastTitle: 'Failed to connect GitHub account.',
      });
    },
  });

  useEffect(() => {
    /*
      This hook is extremely ugly, but it gets the job done: calling connectMutation.mutate() only once.
      The setTimeout() at the end is needed for the mutation state to update correctly. Very weird
      behavior occurs without the setTimeout() - isLoading gets stuck on "true" and never updates.
    */

    if (authStatus !== 'AUTHENTICATED' || typeof codeParam !== 'string' || hasCalledConnect.current) return;

    hasCalledConnect.current = true;

    setTimeout(() => {
      connect({ code: codeParam });

      router.replace(router.asPath.split('?')[0], undefined, { shallow: true });
    });
  }, [codeParam, connect, authStatus, router]);

  if (connectionError) {
    return <Message type="error" content="Failed to load GitHub connection status for your account." />;
  }

  if (!connection || connectMutation.isLoading) {
    return <Spinner center />;
  }

  const { status } = connection;

  switch (status) {
    case 'VALID':
      return <Connected handle={connection.handle}>{props.connected}</Connected>;
    case 'INVALID':
      return <UnconnectedPrompt invalid>{props.unconnected}</UnconnectedPrompt>;
    case 'NONE':
      return <UnconnectedPrompt>{props.unconnected}</UnconnectedPrompt>;
    default:
      assertUnreachable(status);
  }
}

function Connected({ children, handle }: { children: ReactElement; handle: string }) {
  return (
    <Flex stack gap="l">
      <Flex align="center">
        <FeatherIcon icon="github" size="s" />
        <Text size="bodySmall">
          Connected Account:{' '}
          <TextLink external href={`https://github.com/${handle}`} stableId={StableId.GITHUB_CONNECT_HANDLE_LINK}>
            {handle}
          </TextLink>
        </Text>
      </Flex>

      {children}
    </Flex>
  );
}

function UnconnectedPrompt({ children, invalid }: { children: ReactElement; invalid?: boolean }) {
  const { identity } = useAuth();
  const githubIdentityProvider = identity?.providerData.find((data) => data.providerId === 'github.com');

  function formGithubUrl() {
    // https://docs.github.com/en/developers/apps/building-github-apps/identifying-and-authorizing-users-for-github-apps#1-request-a-users-github-identity

    const redirectUrl = new URL(`${window.location.protocol}//${window.location.hostname}${window.location.pathname}`);
    redirectUrl.searchParams.append('githubConnectSuccess', 'true');

    const authorizeUrl = new URL('https://github.com/login/oauth/authorize');
    authorizeUrl.searchParams.append('redirect_uri', redirectUrl.href);
    authorizeUrl.searchParams.append('scope', 'public_repo');
    authorizeUrl.searchParams.append('client_id', config.github.connectClientId);

    if (githubIdentityProvider && githubIdentityProvider.email) {
      // Suggest a specific account to use for signing in and authorizing the app:
      authorizeUrl.searchParams.append('login', githubIdentityProvider.email);
    }

    return authorizeUrl.href;
  }

  return (
    <Flex stack gap="l">
      {invalid && <Message type="warning" content="Your previous GitHub connection expired. Please reconnect below." />}
      {children}
      <ButtonLink href={formGithubUrl()} stableId={StableId.GITHUB_CONNECT_BUTTON} stretch>
        <FeatherIcon icon="github" />
        Connect GitHub
      </ButtonLink>
    </Flex>
  );
}
