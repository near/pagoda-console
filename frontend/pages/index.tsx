import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import { AuthenticationForm } from '@/components/AuthenticationForm';
import { Container } from '@/components/lib/Container';
import { useSimpleLayout } from '@/hooks/layouts';
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
  return (
    <Container size="xs">
      <AuthenticationForm />
    </Container>
  );
};

Login.getLayout = useSimpleLayout;

export default Login;
