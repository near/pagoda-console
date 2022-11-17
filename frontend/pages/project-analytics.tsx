import type { Api } from '@pc/common/types/api';
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
import { withSelectedProject } from '@/components/with-selected-project';
import { useDashboardLayout } from '@/hooks/layouts';
import { useSureProjectContext } from '@/hooks/project-context';
import { useQuery } from '@/hooks/query';
import { useTheme } from '@/hooks/theme';
import config from '@/utils/config';
import { mapEnvironmentSubIdToNet } from '@/utils/helpers';
import { StableId } from '@/utils/stable-ids';

type Contracts = Api.Query.Output<'/projects/getContracts'>;

const ProjectAnalytics = () => {
  const { projectSlug, environmentSubId } = useSureProjectContext();
  const contractsQuery = useQuery(['/projects/getContracts', { project: projectSlug, environment: environmentSubId }]);

  if (contractsQuery.status === 'loading') {
    return <Spinner center />;
  }
  if (contractsQuery.status === 'error') {
    return <div>Error while loading contracts: {String(contractsQuery.error)}</div>;
  }

  if (contractsQuery.data.length === 0) {
    return <NoContractsNotice />;
  }

  return (
    <Section>
      <AnalyticsIframe contracts={contractsQuery.data} />
    </Section>
  );
};

function AnalyticsIframe({ contracts }: { contracts: Contracts }) {
  const { environmentSubId } = useSureProjectContext();
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
  const iframeUrl = `${
    config.analyticsIframeUrl[mapEnvironmentSubIdToNet(environmentSubId)]
  }?${contractParams}${themeParam}`;

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
              <TextLink stableId={StableId.PROJECT_ANALYTICS_NO_CONTRACTS_LINK}>Contracts</TextLink>
            </Link>{' '}
            page to add a contract.
          </Text>

          <Link href="/contracts" passHref>
            <ButtonLink stableId={StableId.PROJECT_ANALYTICS_NO_CONTRACTS_BUTTON_LINK}>
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

export default withSelectedProject(ProjectAnalytics);
