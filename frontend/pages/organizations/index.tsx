import { useRouter } from 'next/router';
import { useEffect } from 'react';

import { Button } from '@/components/lib/Button';
import { Container } from '@/components/lib/Container';
import { Flex } from '@/components/lib/Flex';
import { Message } from '@/components/lib/Message';
import { Spinner } from '@/components/lib/Spinner';
import { useOrganizationsLayout } from '@/hooks/layouts';
import { StableId } from '@/utils/stable-ids';
import type { NextPageWithLayout } from '@/utils/types';

import { useQuery } from '../../hooks/query';

const Organizations: NextPageWithLayout = () => {
  const router = useRouter();
  const organizationsQuery = useQuery(['/users/listOrgs']);

  useEffect(() => {
    if (organizationsQuery.data) {
      const filteredOrgs = organizationsQuery.data.filter((org) => !org.isPersonal);
      if (filteredOrgs.length === 0) {
        router.replace('/organizations/create/');
      } else {
        router.replace(`/organizations/${filteredOrgs[0].slug}/`);
      }
    }
  }, [router, organizationsQuery.data]);

  return (
    <Container size="s">
      <Flex stack gap="l" align="center">
        {organizationsQuery.status === 'error' ? (
          <>
            <Message type="error" content="An error occurred." />{' '}
            <Button stableId={StableId.ORGANIZATIONS_REFETCH_BUTTON} onClick={() => organizationsQuery.refetch()}>
              Refetch
            </Button>
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
