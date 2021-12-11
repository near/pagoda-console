import type { NextPage } from 'next'
import Head from 'next/head'
import dynamic from "next/dynamic";
import { Button } from 'react-bootstrap';
import { useRouter } from 'next/router'
import { authenticatedPost, useAccount, useApiKeys, useProject } from '../utils/fetchers';
import { useIdentity, useRouteParam } from '../utils/hooks';
import { getAuth, signOut, getIdToken } from "firebase/auth";
import { useDashboardLayout } from '../utils/layouts';
import Image from 'next/image';
import Config from '../utils/config';
import { useCallback, useState } from 'react';

//assets
import AnalyticsPreview from '../public/analyticsPreview.png';
import ProjectSelector from '../components/ProjectSelector';
import CodeBlock from '../components/CodeBlock';
import { NetOption } from '../utils/interfaces';
import { useEffect } from 'react';

export default function Analytics() {
    const identity = useIdentity();
    let [methodUsage, setMethodUsage] = useState<Record<string, number>>();

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

    const processUsageChunk = useCallback(async (usageDataRaw: string, methodBreakdown: Record<string, number>, start: number): Promise<{ start: number, methodBreakdown: Record<string, number> }> => {
        let processed = 0;
        for (let i = start; i < usageDataRaw.length && processed < 10; i++) {
            if (usageDataRaw[i] === '\n') {
                const eventRaw = usageDataRaw.substring(start, i);
                start = i + 1;
                processed++;

                const event = JSON.parse(eventRaw);
                if (event.event !== 'request') {
                    continue;
                }
                const { method } = event.properties.body;
                if (!methodBreakdown[method]) {
                    methodBreakdown[method] = 1;
                } else {
                    methodBreakdown[method]++;
                }
            }
        }

        // if (start > usageDataRaw.length) {
        //     // finished
        //     return methodBreakdown;
        // } else {
        //     return processUsageData(usageDataRaw, methodBreakdown, start);
        // }
        return { start, methodBreakdown };
    }, [])

    const fetchUsageData = useCallback(async (project: string) => {
        const { events: usage } = await authenticatedPost('/projects/getRpcUsage', { project });

        let start = 0;
        let methodBreakdown: Record<string, number> = {};
        while (start < usage.length) {
            const { start: newStart } = await processUsageChunk(usage, methodBreakdown, start);
            start = newStart;
        }
        // let methodBreakdown = await processUsageData(usage);
        // debugger;
        setMethodUsage(methodBreakdown);
    }, [processUsageChunk]);

    useEffect(() => {
        if (projectSlug && identity) {
            fetchUsageData(projectSlug);
        }
    }, [projectSlug, fetchUsageData, identity]);

    return <div>
        <Head>
            <title>NEAR Dev Console</title>
            <meta name="description" content="NEAR Developer Console" />
            <link rel="icon" href="/favicon.ico" />
        </Head>
        <div className='pageContainer'>
            <ProjectSelector />
            <h2>Analytics</h2>

            <p>{JSON.stringify(methodUsage)}</p>

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