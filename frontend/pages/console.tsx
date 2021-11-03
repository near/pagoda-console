import type { NextPage } from 'next'
import Head from 'next/head'
import dynamic from "next/dynamic";
import { Button } from 'react-bootstrap';
import { useRouter } from 'next/router'
import { useAccount } from '../utils/hooks';
import firebase from 'firebase';

const ThemeToggle = dynamic(() => import("../components/ThemeToggle"), {
    ssr: false,
});

const Console: NextPage = () => {
    // temp import for POC redirect
    const router = useRouter();
    const [account, error] = useAccount();

    function getWelcomeString () {
        if (account) return <h1>Welcome {account!.name}</h1>
        if (error) return <p>An error occured while fetching account data</p>
        return <p>Loading...</p>
    }

    return <div>
        <Head>
            <title>NEAR Dev Console</title>
            <meta name="description" content="NEAR Developer Console" />
            <link rel="icon" href="/favicon.ico" />
        </Head>
        <div className='temp-buttons'>
            <Button variant='outline-neutral' onClick={() => router.push('/concept')}>Open POC</Button>
            <Button variant='neutral' onClick={() => { firebase.auth().signOut() }}>Sign Out</Button>
            <ThemeToggle />
        </div>
        {getWelcomeString()}
        <style jsx>{`
            .temp-buttons {
                display: flex;
                flex-direction: row;
                width: 20em;
                justify-content: space-between;
            }
        `}</style>
    </div>
}

export default Console;