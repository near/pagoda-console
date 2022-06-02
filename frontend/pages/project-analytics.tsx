import { iframeResizer } from 'iframe-resizer';
import Link from 'next/link';
import { useEffect } from 'react';

import { Button, ButtonLink } from '@/components/lib/Button';
import { Container } from '@/components/lib/Container';
import { FeatherIcon } from '@/components/lib/FeatherIcon';
import { Flex } from '@/components/lib/Flex';
import { H1 } from '@/components/lib/Heading';
import { Section } from '@/components/lib/Section';
import { Spinner } from '@/components/lib/Spinner';
import { Text } from '@/components/lib/Text';
import { useContracts } from '@/hooks/contracts';
import { useDashboardLayout } from '@/hooks/layouts';
import { useSelectedProject } from '@/hooks/selected-project';
import type { Contract, NextPageWithLayout } from '@/utils/types';

const ProjectAnalytics: NextPageWithLayout = () => {
  const { environment, project } = useSelectedProject();
  const { contracts } = useContracts(project?.slug, environment?.subId);

  if (!environment || !contracts || !project) {
    return <Spinner center />;
  }

  if (environment?.net === 'TESTNET') {
    return <TestnetPlaceholder />;
  }

  return (
    <Section>
      <AnalyticsIframe contracts={contracts} />
    </Section>
  );
};

function AnalyticsIframe({ contracts }: { contracts: Contract[] }) {
  useEffect(() => {
    iframeResizer({}, 'iframe');
  }, []);

  let contractQueryParams = '';
  contracts.forEach((contract) => {
    contractQueryParams += `&contract=${contract.address}`;
  });

  const iframeUrl = `https://metabase.near.datrics.ai/public/dashboard/457ac13a-f8cf-41dc-81ad-ef7bd70466b8?${contractQueryParams}#theme=night`;

  return (
    <iframe
      src={iframeUrl}
      frameBorder="0"
      style={{
        width: '1px',
        minWidth: '100%',
      }}
    ></iframe>
  );
}

function TestnetPlaceholder() {
  const { selectEnvironment, environments } = useSelectedProject();

  const mainnetEnvironment = environments?.find((env) => env.net === 'MAINNET');

  if (!mainnetEnvironment) {
    return (
      <Section css={{ margin: 'auto', textAlign: 'center' }}>
        <Container size="s">
          <Flex stack align="center">
            <H1>Analytics</H1>

            <Text>
              Currently, analytics are only viewable for the{' '}
              <Text as="span" color="text1" family="action">
                Mainnet
              </Text>{' '}
              environment. When you complete the tutorial, your project will be set up with a{' '}
              <Text as="span" color="text1" family="action">
                Mainnet
              </Text>{' '}
              environment.
            </Text>

            <Link href="/tutorials/nfts/introduction" passHref>
              <ButtonLink>
                <FeatherIcon icon="book" />
                View Tutorial
              </ButtonLink>
            </Link>
          </Flex>
        </Container>
      </Section>
    );
  }

  return (
    <Section css={{ margin: 'auto', textAlign: 'center' }}>
      <Container size="s">
        <Flex stack align="center">
          <H1>Analytics</H1>

          <Text>
            Currently, analytics are only viewable for the{' '}
            <Text as="span" color="text1" family="action">
              Mainnet
            </Text>{' '}
            environment.{' '}
            <Text as="span" color="text1" family="action">
              Testnet
            </Text>{' '}
            will be supported soon!
          </Text>

          <Button color="neutral" onClick={() => selectEnvironment(mainnetEnvironment?.subId)}>
            <FeatherIcon icon="layers" css={{ color: 'var(--color-mainnet)' }} />
            Switch to Mainnet
          </Button>
        </Flex>
      </Container>
    </Section>
  );
}

ProjectAnalytics.getLayout = useDashboardLayout;

export default ProjectAnalytics;
