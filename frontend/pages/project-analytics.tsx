import { ButtonLink } from '@/components/lib/Button';
import { Container } from '@/components/lib/Container';
import { Flex } from '@/components/lib/Flex';
import { H1 } from '@/components/lib/Heading';
import { Section } from '@/components/lib/Section';
import { Text } from '@/components/lib/Text';
import { useDashboardLayout } from '@/hooks/layouts';
import { StableId } from '@/utils/stable-ids';
import type { NextPageWithLayout } from '@/utils/types';

const ProjectAnalytics: NextPageWithLayout = () => {
  return (
    <Section css={{ margin: 'auto', textAlign: 'center' }}>
      <Container size="s">
        <Flex stack gap="l" align="center">
          <H1>Analytics</H1>

          <Text>
            Pagoda Console Analytics has been deprecated in favor of the ecosystem of apps in Near&lsquo;s Blockchain
            Operating System <br />
            <br />
            <ButtonLink
              stableId={StableId.PROJECT_ANALYTICS_NO_CONTRACTS_BUTTON_LINK}
              href="https://near.org/near/widget/Search.IndexPage?term=analytics"
              external
            >
              Search Analytics d.Apps
            </ButtonLink>
          </Text>
        </Flex>
      </Container>
    </Section>
  );
};

ProjectAnalytics.getLayout = useDashboardLayout;

export default ProjectAnalytics;
