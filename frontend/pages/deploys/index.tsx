import Link from 'next/link';
import { useEffect } from 'react';

import { Card } from '@/components/lib/Card';
import { FeatherIcon } from '@/components/lib/FeatherIcon';
import { Flex } from '@/components/lib/Flex';
import { Section } from '@/components/lib/Section';
import { Text } from '@/components/lib/Text';
import { TextLink } from '@/components/lib/TextLink';
import { useIsRepositoryTransferred, useRepositories } from '@/hooks/deploys';
import { useDashboardLayout } from '@/hooks/layouts';
import { useSelectedProject } from '@/hooks/selected-project';
import DeploysModule from '@/modules/deploys/components/DeploysModule';
import { StableId } from '@/utils/stable-ids';
import type { NextPageWithLayout } from '@/utils/types';

import PageHeader from './components/PageHeader';

const Deploys: NextPageWithLayout = () => {
  const project = useSelectedProject();
  const { repositories } = useRepositories(project.project?.slug);
  const { isTransferred, mutate } = useIsRepositoryTransferred(repositories?.[0].slug);

  useEffect(() => {
    const interval = setInterval(async () => {
      const result = await mutate();
      if (!result?.isTransferred) {
        return;
      }
      clearInterval(interval);
    }, 3000);

    return () => clearInterval(interval);
  }, [mutate]);

  if (isTransferred === undefined) {
    return <></>;
  }

  return (
    <>
      <PageHeader showButtons={isTransferred} />
      {!isTransferred && (
        <Section>
          <Card>
            <Flex stack align="center">
              <FeatherIcon icon="mail" size="l" />
              <Text>{`Please accept the Github repository transfer request in your email to view deployments.`}</Text>
              <Link href={`https://github.com/settings/emails`}>
                <TextLink stableId={StableId.DEPLOYS_GITHUB_EMAIL_LINK} external>
                  {`Find your Github account's email address`}
                </TextLink>
              </Link>
            </Flex>
          </Card>
        </Section>
      )}
      {isTransferred && <DeploysModule />}
    </>
  );
};

Deploys.getLayout = useDashboardLayout;

export default Deploys;
