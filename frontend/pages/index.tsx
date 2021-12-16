import type { NextPage } from 'next'
import Head from 'next/head'
import dynamic from "next/dynamic";
import AuthenticationForm from '../components/AuthenticationForm/AuthenticationForm';
import ConsoleLogo from '../components/ConsoleLogo';

const ThemeToggle = dynamic(() => import("../components/ThemeToggle"), {
  ssr: false,
});

// i18n
import { useTranslation } from 'next-i18next';

import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useSimpleLayout } from '../utils/layouts';
import { usePageTracker } from '../utils/hooks';

export async function getStaticProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common', 'login'])),
      // Will be passed to the page component as props
    },
  };
}

export default function Login() {
  const { t } = useTranslation('login');

  return (
    <div className='pageContainer'>
      <AuthenticationForm />

      {/* <Footer /> */}
      <style jsx>{`
        .pageContainer {
          display: flex;
          flex-direction: column;
          /* justify-content: center; */
          align-items: center;
          width: 22.25rem;
        }
      `}</style>
    </div>
  )
}

// function Footer() {
//   return <footer className='footer'>
//     <div className='footerItem'>
//       <a
//         href="https://near.org"
//         target="_blank"
//         rel="noopener noreferrer"
//       >
//         Near Inc.
//       </a>
//     </div>
//     <style jsx>{`
//       .footer {
//         width: 100%;
//         height: 100px;
//         border-top: 1px solid #eaeaea;
//         display: flex;
//         justify-content: center;
//         align-items: center;
//       }
//       .footerItem {
//         margin: 0 1em;
//       }
//   `}</style>
//   </footer>
// }

Login.getLayout = useSimpleLayout;
// Login.getFooter = Footer;