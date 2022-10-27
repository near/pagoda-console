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
import { useSimpleLayout } from '@/hooks/layouts';
import { usePublicStore } from '@/stores/public';
import { StableId } from '@/utils/stable-ids';
import type { Contract, NetOption, NextPageWithLayout } from '@/utils/types';
import { netOptions } from '@/utils/types';

const Public: NextPageWithLayout = () => {
  const activatePublicMode = usePublicStore((store) => store.activatePublicMode);
  const setContracts = usePublicStore((store) => store.setContracts);
  const router = useRouter();
  const redirectPageNameParam = router.query.redirectPageName as string;
  const addressesParam = router.query.addresses as string;
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
    if (isValidUrl && !hasRedirected.current) {
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

      router.replace(`/${redirectPageNameParam}`);
    }
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
