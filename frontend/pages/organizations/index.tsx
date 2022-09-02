import { useRouter } from 'next/router';
import { useEffect } from 'react';

import { Button } from '@/components/lib/Button';
import { Container } from '@/components/lib/Container';
import { Flex } from '@/components/lib/Flex';
import { Message } from '@/components/lib/Message';
import { Spinner } from '@/components/lib/Spinner';
import { useOrganizationsLayout } from '@/hooks/layouts';
import { useOrganizations } from '@/hooks/organizations';
import type { NextPageWithLayout } from '@/utils/types';

const Organizations: NextPageWithLayout = () => {
  const router = useRouter();
  const { organizations, error, mutate: refetchOrganizations } = useOrganizations(true);

  useEffect(() => {
    if (organizations) {
      if (organizations.length === 0) {
        router.replace('/organizations/create/');
      } else {
        router.replace(`/organizations/${organizations[0].slug}/`);
      }
    }
  }, [router, organizations]);

  return (
    <Container size="s">
      <Flex stack gap="l" align="center">
        {error ? (
          <>
            <Message type="error" content="An error occurred." />{' '}
            <Button onClick={() => refetchOrganizations()}>Refetch</Button>
          </>
        ) : (
          <Spinner center />
        )}
      </Flex>
    </Container>
  );
};

Organizations.getLayout = useOrganizationsLayout;

export default Organizations;
