import type { NextPage } from 'next'
import Head from 'next/head'
import dynamic from "next/dynamic";
import AuthenticationForm from '../components/AuthenticationForm/AuthenticationForm';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { useRouter } from 'next/router'

const ThemeToggle = dynamic(() => import("../components/ThemeToggle"), {
  ssr: false,
});

// i18n
import { useTranslation } from 'next-i18next';


// assets
// import styles from '../styles/Home.module.css'
import ConsoleMark from '../public/ConsoleMark.svg'


import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

export async function getStaticProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common', 'login'])),
      // Will be passed to the page component as props
    },
  };
}

const Home: NextPage = () => {
  const { t } = useTranslation('login');

  return (
    <div className='pageContainer'>
      <Head>
        <title>NEAR Dev Console</title>
        <meta name="description" content="NEAR Developer Console" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className='main'>
        <div className='logoContainer'>
          <ConsoleMark style={{ width: '100%', height: '100%' }} />
        </div>
        <p className='welcomeText'>
          {t('login')}
        </p>

        <AuthenticationForm />
      </main>

      <Footer />
      <style jsx>{`
        .logoContainer {
          width : 40em;
          max-width: 100vw;
          padding: 2em;
        }

        .welcomeText {
          font-size: 4rem;
          font-weight: 500;
        }

        .pageContainer {
          height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }

        .main {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }
      `}</style>
    </div>
  )
}

function Footer() {
  return <footer className='footer'>
    <div className='footerItem'>
      <a
        href="https://near.org"
        target="_blank"
        rel="noopener noreferrer"
      >
        Near Inc.
      </a>
    </div>
    <style jsx>{`
      .footer {
        width: 100%;
        height: 100px;
        border-top: 1px solid #eaeaea;
        display: flex;
        justify-content: center;
        align-items: center;
      }
      .footerItem {
        margin: 0 1em;
      }
  `}</style>
  </footer>
}

export default Home
