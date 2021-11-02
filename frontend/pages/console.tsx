import type { NextPage } from 'next'
import Head from 'next/head'
import dynamic from "next/dynamic";
import { Button } from 'react-bootstrap';
import { useRouter } from 'next/router'

const ThemeToggle = dynamic(() => import("../components/ThemeToggle"), {
    ssr: false,
});

const Console: NextPage = () => {
    // temp import for POC redirect
    const router = useRouter();

    return <div>
        <Head>
            <title>NEAR Dev Console</title>
            <meta name="description" content="NEAR Developer Console" />
            <link rel="icon" href="/favicon.ico" />
        </Head>
        <Button onClick={() => router.push('/concept')}>Open POC</Button>
    </div>
}

export default Console;