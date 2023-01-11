import { FeatherIcon } from '@/components/lib/FeatherIcon';
import { Flex } from '@/components/lib/Flex';
import { H1 } from '@/components/lib/Heading';
import { Section } from '@/components/lib/Section';

const PageHeader = () => (
  <Section>
    <Flex stack gap="l">
      <Flex align="center">
        <Flex align="center" justify="start">
          <FeatherIcon icon="git-branch" size="m" />
          <H1>Deploys</H1>
        </Flex>

      </Flex>
    </Flex>
  </Section>
);

export default PageHeader;
