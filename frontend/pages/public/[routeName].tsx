import Link from 'next/link';
import { useRouter } from 'next/router';
import { useRef } from 'react';

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
  const routeNameParam = router.query.routeName as string;
  const addressesParam = router.query.addresses as string;
  const netParam = router.query.net as NetOption;
  const addresses = addressesParam ? addressesParam.split(',') : [];
  const addressesAreValid = addresses.length > 0;
  const netIsValid = netOptions.includes(netParam);
  const routeNameIsValid = ['analytics', 'contracts'].includes(routeNameParam);
  const isValidUrl = addressesAreValid && netIsValid && routeNameIsValid;
  const hasRedirected = useRef(false);

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

    router.replace(`/${routeNameParam}`);
  }

  return (
    <Section>
      <Container size="xs">
        {isValidUrl ? (
          <Spinner center />
        ) : (
          <Flex stack align="center" gap="l">
            <Message type="error">Oops! This public URL is invalid.</Message>
            <Link href="/">
              <ButtonLink stableId={StableId.PUBLIC_INVALID_URL_HOME_LINK}>
                <FeatherIcon icon="arrow-left" />
                Go Home
              </ButtonLink>
            </Link>
          </Flex>
        )}
      </Container>
    </Section>
  );
};

Public.getLayout = useSimpleLayout;

export default Public;
