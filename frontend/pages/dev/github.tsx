// dev only page
export { getStaticProps } from '@/utils/dev-only';

import { useRouter } from 'next/router';
import { useEffect } from 'react';

import { ButtonLink } from '@/components/lib/Button';
import { Section } from '@/components/lib/Section';
import { useApiMutation } from '@/hooks/api-mutation';
// import { ConfirmModal } from '@/components/modals/ConfirmModal';
import { useAuth } from '@/hooks/auth';
import { useGithubConnection } from '@/hooks/github';
import { useSimpleLayout } from '@/hooks/layouts';
import config from '@/utils/config';
import { StableId } from '@/utils/stable-ids';
import type { NextPageWithLayout } from '@/utils/types';

function formGithubUrl() {
  const authorizeUrl = new URL('https://github.com/login/oauth/authorize');
  // TODO update URL when this is moved to a new page
  authorizeUrl.searchParams.append('redirect_uri', `${config.url.host}/dev/github`);
  authorizeUrl.searchParams.append('scope', 'public_repo');

  const clientId = process.env.NEXT_PUBLIC_GITHUB_CONNECT_CLIENT_ID;
  if (!clientId) {
    throw new Error('Missing GitHub client ID');
  }
  authorizeUrl.searchParams.append('client_id', clientId);

  // TODO: suggest login if user logged into Console with GitHub
  // GitHub docs: "Suggests a specific account to use for signing in and authorizing the app."
  // authorizeUrl.searchParams.append('login', <user handle>);

  return authorizeUrl.href;
}

const Page: NextPageWithLayout = () => {
  const router = useRouter();
  const { code } = router.query;
  const { authStatus } = useAuth();

  const { mutate, ...connectGithubMut } = useApiMutation('/users/connectGithub', {
    onError: (e) => {
      console.error(e);
    },
  });

  // TODO import and use `error`
  const { connection, error: connectionError } = useGithubConnection();

  useEffect(() => {
    if (authStatus !== 'AUTHENTICATED' || !code || typeof code !== 'string') return;

    router.replace(router.pathname, undefined, { shallow: true });

    mutate({ code });
  }, [code, mutate, authStatus, router]);

  return (
    <Section>
      <ButtonLink href={formGithubUrl()} stableId={StableId.GITHUB_CONNECT_BUTTON}>
        Connect GitHub
      </ButtonLink>
      <p>{code ?? 'none'}</p>
      <p>status: {connectGithubMut.status}</p>
      <p>error: {JSON.stringify(connectGithubMut.error)}</p>
      {connection?.status === 'VALID' && <p>Connected as: {connection.handle}</p>}
      {connectionError && <p>Could not fetch connection: {JSON.stringify(connectionError)}</p>}
    </Section>
  );
};

Page.getLayout = useSimpleLayout;

export default Page;
