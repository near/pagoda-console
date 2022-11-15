import type { Api } from '@pc/common/types/api';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';

import { ButtonLink } from '@/components/lib/Button';
import { Container } from '@/components/lib/Container';
import { FeatherIcon } from '@/components/lib/FeatherIcon';
import { Flex } from '@/components/lib/Flex';
import { Message } from '@/components/lib/Message';
import { Section } from '@/components/lib/Section';
import { Spinner } from '@/components/lib/Spinner';
import { useAuth } from '@/hooks/auth';
import { useSimpleLayout } from '@/hooks/layouts';
import { usePublicStore } from '@/stores/public';
import analytics from '@/utils/analytics';
import { StableId } from '@/utils/stable-ids';
import type { NetOption, NextPageWithLayout } from '@/utils/types';
import { netOptions } from '@/utils/types';

type Contract = Api.Query.Output<'/projects/getContract'>;

const Public: NextPageWithLayout = () => {
  const { authStatus } = useAuth();
  const activatePublicMode = usePublicStore((store) => store.activatePublicMode);
  const setContracts = usePublicStore((store) => store.setContracts);
  const router = useRouter();
  const redirectPageNameParam = router.query.redirectPageName as string;
  const addressesParam = router.query.addresses as string;
  const sharedParam = router.query.shared as string;
  const netParam = router.query.net as NetOption;
  const addresses = addressesParam ? addressesParam.split(',') : [];
  const addressesAreValid = addresses.length > 0;
  const netIsValid = netOptions.includes(netParam);
  const routeNameIsValid = ['analytics', 'contracts'].includes(redirectPageNameParam);
  const hasRedirected = useRef(false);
  const [isValidUrl, setIsValidUrl] = useState<boolean>();

  useEffect(() => {
    if (router.isReady) {
      setIsValidUrl(addressesAreValid && netIsValid && routeNameIsValid);
    }
  }, [addressesAreValid, netIsValid, router, routeNameIsValid]);

  useEffect(() => {
    if (hasRedirected.current) return;
    if (!isValidUrl) return;
    if (authStatus === 'LOADING') return;

    hasRedirected.current = true;

    const contracts: Contract[] = addresses.map((address) => {
      return {
        address,
        slug: address,
        net: netParam,
      };
    });

    setContracts(contracts);
    activatePublicMode();

    analytics.track('DC Public Mode Activated', {
      existingUser: authStatus === 'AUTHENTICATED',
      shared: sharedParam === 'true',
      url: window.location.pathname + window.location.search,
    });

    router.replace(`/${redirectPageNameParam}`);
  });

  return (
    <Section>
      <Container size="s">
        {isValidUrl === false ? (
          <Flex stack align="center" gap="l">
            <Message icon="link" type="error" css={{ width: 'auto' }}>
              Oops! This public URL is invalid.
            </Message>
            <Link href="/">
              <ButtonLink stableId={StableId.PUBLIC_INVALID_URL_HOME_LINK}>
                <FeatherIcon icon="arrow-left" />
                Go Home
              </ButtonLink>
            </Link>
          </Flex>
        ) : (
          <Spinner center />
        )}
      </Container>
    </Section>
  );
};

Public.getLayout = useSimpleLayout;

export default Public;
