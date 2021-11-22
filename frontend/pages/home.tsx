import type { NextPage } from 'next'
import Head from 'next/head'
import dynamic from "next/dynamic";
import { Button } from 'react-bootstrap';
import { useRouter } from 'next/router'
import { useAccount } from '../utils/fetchers';
import { useRouteParam } from '../utils/hooks';
import { getAuth, signOut, getIdToken } from "firebase/auth";
import { useDashboardLayout } from '../utils/layouts';

export default function Home() {
    const project = useRouteParam('project', '/projects');
    const { user, error } = useAccount();


    function getWelcomeString() {
        if (user) return <h1>Welcome {user!.name}</h1>
        if (error) return <p>An error occured while fetching user data</p>
        return <p>Loading...</p>
    }

    return <div>
        <Head>
            <title>NEAR Dev Console</title>
            <meta name="description" content="NEAR Developer Console" />
            <link rel="icon" href="/favicon.ico" />
        </Head>
        {getWelcomeString()}
        <style jsx>{`
        `}</style>
    </div>
}

Home.getLayout = useDashboardLayout;