import type { NextPage } from 'next'
import Head from 'next/head'
import dynamic from "next/dynamic";
import { Button } from 'react-bootstrap';
import { useRouter } from 'next/router'
import { useAccount, useApiKeys, useProject } from '../utils/fetchers';
import { useRouteParam } from '../utils/hooks';
import { getAuth, signOut, getIdToken } from "firebase/auth";
import { useDashboardLayout } from '../utils/layouts';
import Image from 'next/image';
import Config from '../utils/config';

//assets
import AnalyticsPreview from '../public/analyticsPreview.png';
import ProjectSelector from '../components/ProjectSelector';
import CodeBlock from '../components/CodeBlock';
import { NetOption } from '../utils/interfaces';

export default function Analytics() {
    const projectSlug = useRouteParam('project');
    const { keys } = useApiKeys(projectSlug, {
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
    });

    // TODO (P2+) determine net by other means than subId
    const environmentSubIdRaw = useRouteParam('environment');
    const environmentSubId = typeof environmentSubIdRaw === 'string' ? parseInt(environmentSubIdRaw) : null;

    let setupCode = '';
    if (environmentSubId) {
        const net: NetOption = environmentSubId === 2 ? 'MAINNET' : 'TESTNET';
        setupCode = keys?.TESTNET ? `near set-api-key ${Config.url.rpc.default[net]} ${keys?.[net]}` : '';
    }

    return <div>
        <Head>
            <title>NEAR Dev Console</title>
            <meta name="description" content="NEAR Developer Console" />
            <link rel="icon" href="/favicon.ico" />
        </Head>
        <div className='pageContainer'>
            <ProjectSelector />
            <h2>Analytics</h2>

            <h3 className='welcomeText'>&#128075; Welcome to your new project</h3>
            {/* <div className='onboardingContainer'>
                <Image src={AnalyticsPreview} alt='Preview of populated analytics page' />
                <div className='onboardingText'>
                    <span className='boldText'>To see usage data, including breakdowns by method call: </span>
                    <span>use your new API key with near-cli or near-api-js. </span>
                    <a>How do I use my API key?</a>
                </div>
            </div> */}
            <div className='onboardingText'>
                <span className='boldText'>To see usage data, including breakdowns by method call: </span>
                <span>use your new API key with near-cli or near-api-js. </span>
                <a>How do I use my API key?</a>
            </div>

            NEAR CLI:
            <CodeBlock language="bash">{setupCode}</CodeBlock>

            <Image src={AnalyticsPreview} alt='Preview of populated analytics page' />
        </div>
        <style jsx>{`
            .pageContainer {
            display: flex;
            flex-direction: column;
            }
            .onboardingContainer {
                display: flex;
                flex-direction: row;
                align-items: center;
                column-gap: 1.5rem;
            }
            .boldText {
                font-weight: 700;
            }
            .welcomeText {
                margin-top: 2rem;
            }
            a {
                color: var(--color-primary)
            }
            .onboardingText {
                margin-bottom: 3rem;
                /* max-width: 22.25rem; */
            }
        `}</style>
    </div>
}

Analytics.getLayout = useDashboardLayout;