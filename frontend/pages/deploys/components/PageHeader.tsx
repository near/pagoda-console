import { Button } from '@/components/lib/Button';
import { FeatherIcon } from '@/components/lib/FeatherIcon';
import { Flex } from '@/components/lib/Flex';
import { H1 } from '@/components/lib/Heading';
import { Section } from '@/components/lib/Section';
import { StableId } from '@/utils/stable-ids';

const PageHeader = () => (
  <Section>
    <Flex stack gap="l">
      <Flex align="center">
        <Flex align="center" justify="start">
          <FeatherIcon icon="git-branch" size="m" />
          <H1>Deploys</H1>
        </Flex>

        <Flex justify="end">
          <Button color="neutral" stableId={StableId.CONTRACTS_OPEN_SHARE_CONTRACTS_MODAL_BUTTON} hideText="tablet">
            <FeatherIcon icon="share" /> GitHub Repo
          </Button>

          <Button stableId={StableId.CONTRACTS_OPEN_ADD_CONTRACT_MODAL_BUTTON} hideText="tablet">
            <FeatherIcon icon="code" /> Code
          </Button>
        </Flex>
      </Flex>
    </Flex>
  </Section>
);

export default PageHeader;
