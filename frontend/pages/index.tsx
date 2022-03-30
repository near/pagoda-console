import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import AuthenticationForm from '../components/AuthenticationForm';
import { useSimpleLayout } from '../utils/layouts';
import type { NextPageWithLayout } from '../utils/types';

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
    <div className="pageContainer">
      <AuthenticationForm />

      <style jsx>{`
        .pageContainer {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 22.25rem;
        }
      `}</style>
    </div>
  );
};

Login.getLayout = useSimpleLayout;

export default Login;
