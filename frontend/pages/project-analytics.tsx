import { iframeResizer } from 'iframe-resizer';
import Link from 'next/link';
import { useEffect, useRef } from 'react';

import { ButtonLink } from '@/components/lib/Button';
import { Container } from '@/components/lib/Container';
import { FeatherIcon } from '@/components/lib/FeatherIcon';
import { Flex } from '@/components/lib/Flex';
import { H1 } from '@/components/lib/Heading';
import { Section } from '@/components/lib/Section';
import { Spinner } from '@/components/lib/Spinner';
import { Text } from '@/components/lib/Text';
import { TextLink } from '@/components/lib/TextLink';
import { useContracts } from '@/hooks/contracts';
import { useDashboardLayout } from '@/hooks/layouts';
import { useSelectedProject } from '@/hooks/selected-project';
import { useTheme } from '@/hooks/theme';
import config from '@/utils/config';
import type { Contract, Environment, NextPageWithLayout } from '@/utils/types';

const ProjectAnalytics: NextPageWithLayout = () => {
  const { environment, project } = useSelectedProject();
  const { contracts } = useContracts(project?.slug, environment?.subId);

  if (!environment || !contracts || !project) {
    return <Spinner center />;
  }

  if (contracts.length === 0) {
    return <NoContractsNotice />;
  }

  return (
    <Section>
      <AnalyticsIframe environment={environment} contracts={contracts} />
    </Section>
  );
};

function AnalyticsIframe({ environment, contracts }: { environment: Environment; contracts: Contract[] }) {
  const { activeTheme } = useTheme();
  const iframeId = 'analytics-iframe';
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      iframeResizer({}, `#${iframeId}`);
      initialized.current = true;
    }
  }, []);

  const themeParam = activeTheme === 'dark' ? '#theme=night' : '';
  let contractParams = '';
  contracts.forEach((contract) => {
    contractParams += `&contract=${contract.address}`;
  });
  const iframeUrl = `${config.analyticsIframeUrl[environment.net]}?${contractParams}${themeParam}`;

  return (
    <iframe
      id={iframeId}
      src={iframeUrl}
      frameBorder="0"
      style={{
        width: '1px',
        minWidth: '100%',
      }}
    ></iframe>
  );
}

function NoContractsNotice() {
  return (
    <Section css={{ margin: 'auto', textAlign: 'center' }}>
      <Container size="s">
        <Flex stack gap="l" align="center">
          <H1>Analytics</H1>

          <Text>
            Your selected project and environment doesn&apos;t have any saved contracts yet. Visit the{' '}
            <Link href="/contracts" passHref>
              <TextLink>Contracts</TextLink>
            </Link>{' '}
            page to add a contract.
          </Text>

          <Link href="/contracts" passHref>
            <ButtonLink>
              <FeatherIcon icon="zap" />
              Contracts
            </ButtonLink>
          </Link>
        </Flex>
      </Container>
    </Section>
  );
}

ProjectAnalytics.getLayout = useDashboardLayout;

export default ProjectAnalytics;
