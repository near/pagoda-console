import { NextPageWithLayout } from '../utils/types';
import AuthenticationForm from '../components/AuthenticationForm/AuthenticationForm';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useSimpleLayout } from '../utils/layouts';

export async function getStaticProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common', 'login'])),
      // Will be passed to the page component as props
    },
  };
}

const Login: NextPageWithLayout = () => {
  const { t } = useTranslation('login');

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
