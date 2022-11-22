import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import { ContractTemplateList } from '@/components/contract-templates/ContractTemplateList';
import { Container } from '@/components/lib/Container';
import { Flex } from '@/components/lib/Flex';
import { H2 } from '@/components/lib/Heading';
import { Section } from '@/components/lib/Section';
import { Text } from '@/components/lib/Text';
import { useSimpleLayout } from '@/hooks/layouts';
import { AuthForm } from '@/modules/core/components/AuthForm';
import type { NextPageWithLayout } from '@/utils/types';

/*
  Translation Example:

  import { useTranslation } from 'next-i18next';
  ...
  const { t } = useTranslation('login');
*/

export async function getStaticProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common', 'login'])),
      // Will be passed to the page component as props
    },
  };
}

const Login: NextPageWithLayout = () => {
  const router = useRouter();

  return (
    <Flex align="stretch" stack={{ '@laptop': true }} css={{ minHeight: '100%' }}>
      <Section noBorder css={{ display: 'flex', alignItems: 'center' }}>
        <Container size="xs">
          <Flex stack gap="l">
            <H2>Sign In</H2>
            <AuthForm />
          </Flex>
        </Container>
      </Section>

      <Section noBorder background="surface1" css={{ display: 'flex', alignItems: 'center' }}>
        <Container css={{ maxWidth: '32.5rem' }}>
          <Flex stack gap="l">
            <Flex stack>
              <H2>Launch & Explore a Project</H2>
              <Text>Want to take console for a spin? Deploy an example project in one-click to get started!</Text>
            </Flex>
            <ContractTemplateList onSelect={(template) => router.push(`/pick-project-template/${template.slug}`)} />
          </Flex>
        </Container>
      </Section>
    </Flex>
  );
};

Login.getLayout = useSimpleLayout;

export default Login;
