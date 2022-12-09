import { useRouter } from 'next/router';

import { Button } from '@/components/lib/Button';
import { Container } from '@/components/lib/Container';
import { Flex } from '@/components/lib/Flex';
import { Message } from '@/components/lib/Message';
import { Section } from '@/components/lib/Section';
import { Spinner } from '@/components/lib/Spinner';
import { useOrganizationsLayout } from '@/hooks/layouts';
import { useQuery } from '@/hooks/query';
import { StableId } from '@/utils/stable-ids';
import type { NextPageWithLayout } from '@/utils/types';

const Organizations: NextPageWithLayout = () => {
  const router = useRouter();
  const organizationsQuery = useQuery(['/users/listOrgs'], {
    onSuccess: (result) => {
      const filteredOrgs = result.filter((org) => !org.isPersonal);
      if (filteredOrgs.length === 0) {
        router.replace('/organizations/create/');
      } else {
        router.replace(`/organizations/${filteredOrgs[0].slug}/`);
      }
    },
  });

  return (
    <Section>
      <Container size="s">
        <Flex stack gap="l" align="center">
          {organizationsQuery.status === 'error' ? (
            <>
              <Message type="error" content="An error occurred." />{' '}
              <Button
                stableId={StableId.ORGANIZATIONS_REFETCH_BUTTON}
                onClick={() => organizationsQuery.invalidateCache()}
              >
                Refetch
              </Button>
            </>
          ) : (
            <Spinner center />
          )}
        </Flex>
      </Container>
    </Section>
  );
};

Organizations.getLayout = useOrganizationsLayout;

export default Organizations;
