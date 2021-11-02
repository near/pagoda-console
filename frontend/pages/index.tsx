import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import Head from 'next/head'
import dynamic from "next/dynamic";
import { useEffect } from 'react'
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';
import firebase from 'firebase';

const ThemeToggle = dynamic(() => import("../components/ThemeToggle"), {
  ssr: false,
});

// assets
// import styles from '../styles/Home.module.css'
import ConsoleMark from '../public/ConsoleMark.svg'

// Configure FirebaseUI.
const uiConfig = {
  // Popup signin flow rather than redirect flow.
  signInFlow: 'popup',
  signInOptions: [
    firebase.auth.GoogleAuthProvider.PROVIDER_ID,
    firebase.auth.GithubAuthProvider.PROVIDER_ID,
  ],
  callbacks: {
    // Avoid redirects after sign-in.
    signInSuccessWithAuthResult: () => false,
  },
};

const Home: NextPage = () => {
  return (
    <div className='container'>
      <Head>
        <title>NEAR Dev Console</title>
        <meta name="description" content="NEAR Developer Console" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className='main'>
        <div className='logoContainer'>
          <ConsoleMark style={{ width: '100%', height: '100%'}}/>
        </div>
        <p className='welcomeText'>
          Login
        </p>

        <SignInSelector />
      </main>

      <footer className='footer'>
        <a
          href="https://near.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Near Inc.
        </a>
      </footer>
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

        .container {
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

        .footer {
          width: 100%;
          height: 100px;
          border-top: 1px solid #eaeaea;
          display: flex;
          justify-content: center;
          align-items: center;
        }
      `}</style>
    </div>
  )
}

function SignInSelector() {
  const router = useRouter();
  // Listen to the Firebase Auth state and set the local state.
  useEffect(() => {
    const unregisterAuthObserver = firebase.auth().onAuthStateChanged(user => {
      if (user) {
        router.push('/console');
      }
    });
    return () => unregisterAuthObserver(); // Make sure we un-register Firebase observers when the component unmounts.
  }, [router]);

  return (
    <div style={{ padding: '2em 0', height: '16rem' }}>
      <StyledFirebaseAuth uiConfig={uiConfig} firebaseAuth={firebase.auth()} />
    </div>
  );
}

export default Home
