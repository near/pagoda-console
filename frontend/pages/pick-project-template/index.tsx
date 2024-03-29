import Link from 'next/link';
import { useRouter } from 'next/router';

import { ContractTemplateList } from '@/components/contract-templates/ContractTemplateList';
import { Container } from '@/components/lib/Container';
import { FeatherIcon } from '@/components/lib/FeatherIcon';
import { Flex } from '@/components/lib/Flex';
import { H2 } from '@/components/lib/Heading';
import { Section } from '@/components/lib/Section';
import { Text } from '@/components/lib/Text';
import { TextLink } from '@/components/lib/TextLink';
import { useSimpleLogoutLayout } from '@/hooks/layouts';
import { StableId } from '@/utils/stable-ids';
import type { NextPageWithLayout } from '@/utils/types';

const PickProjectTemplate: NextPageWithLayout = () => {
  const router = useRouter();

  return (
    <Section>
      <Container size="m">
        <Flex stack gap="xl">
          <Flex stack>
            <Link href="/pick-project" passHref>
              <TextLink stableId={StableId.PROJECT_TEMPLATES_BACK_TO_PROJECT_TYPE_LINK}>
                <FeatherIcon icon="arrow-left" /> Project Type
              </TextLink>
            </Link>
            <H2>Explore a Project</H2>
            <Text>Want to take console for a spin? Deploy an example project in one-click to get started!</Text>
          </Flex>

          <ContractTemplateList onSelect={(template) => router.push(`/pick-project-template/${template.slug}`)} />
        </Flex>
      </Container>
    </Section>
  );
};

PickProjectTemplate.getLayout = useSimpleLogoutLayout;

export default PickProjectTemplate;
