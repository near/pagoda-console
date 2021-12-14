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
import AnalyticsPreview from '../public/analyticsPreview.png';
import ProjectSelector from '../components/ProjectSelector';
import CodeBlock from '../components/CodeBlock';
import { NetOption, UsageData } from '../utils/interfaces';
import { useEffect } from 'react';
import Highcharts from 'highcharts'
import BorderSpinner from '../components/BorderSpinner';
import AnalyticsCard from '../components/AnalyticsCard';
import { getUserData, updateUserData } from '../utils/cache';
import config from '../utils/config';


export default function Analytics() {
    useEffect(() => {
        Highcharts.setOptions({
            chart: {
                style: {
                    fontFamily: 'Manrope, sans-serif'
                }
            }
        });
    }, []);
    const identity = useIdentity();
    // TODO do we need this since it doesnt drive anything? we use the chart option states for rending
    let [usageData, setUsageData] = useState<UsageData>();

    const [methodBreakdownChartOptions, setMethodBreakdownChartOptions] = useState<Highcharts.Options>();
    const [responseCodeChartOptions, setResponseCodeChartOptions] = useState<Highcharts.Options>();

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

    const processUsageChunk = useCallback(async (usageDataRaw: string, usage: UsageData, start: number): Promise<{ start: number, usage: UsageData }> => {
        let processed = 0;
        for (let i = start; i < usageDataRaw.length && processed < 10; i++) {
            if (usageDataRaw[i] === '\n') {
                const eventRaw = usageDataRaw.substring(start, i);
                start = i + 1;
                processed++;

                const event = JSON.parse(eventRaw);

                switch (event.event) {
                    case 'request':
                        //calls for this method
                        let { method } = event.properties.body;
                        switch (method) {
                            case 'query':
                                method = `query/${event.properties.body.params.request_type}`
                                break;
                            case 'block':
                                // TODO (P2+) make this handle params dynamically so it wont break if rpc is updated
                                method = `block/${event.properties.body.params.finality ? 'finality' : 'block_id'}`
                                break;
                            default:
                                break;
                        }

                        if (!usage.methods[method]) {
                            usage.methods[method] = 1;
                        } else {
                            usage.methods[method]++;
                        }

                        // total calls
                        usage.calls++;
                        break;
                    case 'response':
                        let { status_code } = event.properties;

                        // DEBUGGING - view all codes in pie chart
                        // if (Math.random() > 0.8) {
                        //     status_code = '403'
                        // } else if (Math.random() > 0.6) {
                        //     status_code = '400'
                        // }

                        if (!usage.responseCodes[status_code]) {
                            usage.responseCodes[status_code] = 1;
                        } else {
                            usage.responseCodes[status_code]++;
                        }
                        break;
                    default:
                        break;
                }
            }
        }
        return { start, usage };
    }, [])

    const loadUsageData = useCallback(async (uid: string, project: string, usageData?: UsageData) => {
        if (usageData) {
            const previouslyFetchedAt = new Date(usageData.fetchedAt);
            const difference = new Date().valueOf() - previouslyFetchedAt.valueOf();
            if (difference > config.usagePersistenceMinutes * 60 * 1000) {
                usageData = undefined;
            }
        }

        if (!usageData) {
            // fetch from API
            let { events: usage } = await authenticatedPost('/projects/getRpcUsage', { project });

            // initialize
            usageData = {
                methods: {},
                responseCodes: {},
                fetchedAt: new Date().toISOString(),
                calls: 0
            };

            let start = 0;
            while (start < usage.length) {
                const { start: newStart } = await processUsageChunk(usage, usageData, start);
                start = newStart;
            }

            updateUserData(uid, { usageData });
        }

        setUsageData(usageData as UsageData);
        setMethodBreakdownChartOptions(getMethodChartOptions(usageData.methods!));
        setResponseCodeChartOptions(getResponseChartOptions(usageData.responseCodes!));
    }, [processUsageChunk]);

    useEffect(() => {
        if (projectSlug && identity) {
            const cachedUsageData = getUserData(identity.uid);
            loadUsageData(identity.uid, projectSlug, cachedUsageData?.usageData);
        }
    }, [projectSlug, loadUsageData, identity]);


    // TODO (P2+) extract to specialized component
    function getMethodChartOptions(methodBreakdown: UsageData['methods']) {
        if (methodBreakdown) {
            const options: Highcharts.Options = {
                title: {
                    text: 'Calls by Method'
                },
                chart: {
                    type: 'bar',
                    // backgroundColor: 'transparent',
                },
                yAxis: {
                    title: {
                        text: 'Method Calls'
                    }
                },
                xAxis: {
                    categories: Object.keys(methodBreakdown),
                },
                legend: {
                    enabled: false
                },
                exporting: {
                    enabled: false
                },
                series: [{
                    type: 'bar',
                    name: 'Method Calls',
                    data: Object.keys(methodBreakdown).map(method => methodBreakdown![method]),
                    color: '#5F8AFA' // NEAR accent blue
                }]
            };
            return options;
        }
    }

    function getResponseChartOptions(responseCodes: UsageData['responseCodes']) {
        const options: Highcharts.Options = {
            title: {
                text: 'Service Response Codes'
            },
            chart: {
                type: 'pie',
                backgroundColor: 'transparent',
            },
            exporting: {
                enabled: false
            },
            series: [{
                name: 'Response Codes',
                type: 'pie',
                data: Object.keys(responseCodes).map(code => ({
                    name: code,
                    y: responseCodes[code],
                    ...(code === '200' ? { color: '#AAD055' } : {})
                }))
            }]
        };
        return options;
    }

    function formatTotalCalls(calls: number) {
        if (calls < 1000) {
            return calls.toString();
        } else if (calls < 10000) {
            return (calls / 1000).toFixed(1).toString() + 'K';
        } else {
            return (calls / 1000).toFixed(0).toString() + 'K';
        }
    }

    return <div>
        <Head>
            <title>NEAR Dev Console</title>
            <meta name="description" content="NEAR Developer Console" />
            <link rel="icon" href="/favicon.ico" />
        </Head>
        <div className='pageContainer'>
            <ProjectSelector />
            {usageData ?
                <div className='analyticsContainer'>
                    <div className="usageCards">
                        {methodBreakdownChartOptions && <div className="primary">
                            <AnalyticsCard
                                chartOptions={methodBreakdownChartOptions}
                            />
                        </div>}
                        {usageData.calls && <div className="secondary">
                            <AnalyticsCard simple={{ label: 'Calls', value: formatTotalCalls(usageData.calls) }} />
                        </div>}
                        {responseCodeChartOptions && <div className="tertiary">
                            <AnalyticsCard
                                chartOptions={responseCodeChartOptions}
                            />
                        </div>}
                    </div>
                    <div className="lastUpdated">
                        <span>Last updated at: {new Date(usageData.fetchedAt).toLocaleString()}</span>
                        <span>Data may be fetched once per hour</span>
                    </div>
                </div> : <div className='rpcLoading'>
                    <div className='spinnerContainer'><BorderSpinner /></div>
                    Fetching RPC usage data. This may take a few seconds.
                </div>
            }

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
            .usageCards {
                display: grid;
                grid-template-columns: 1fr 1fr;
                grid-template-rows: auto;
                column-gap: 2rem;
                row-gap: 2rem;
                grid-template-areas:
                  "primary primary"
                  "secondary tertiary";
            }
            .primary {
                grid-area: primary;
            }
            .secondary {
                grid-area: secondary;
            }
            .tertiary {
                grid-area: tertiary;
            }
            .rpcLoading {
                display: flex;
                flex-direction: row;
                align-items: center;
                margin-top: 1rem;
            }
            .spinnerContainer {
                margin-right: 1rem;
            }
            .lastUpdated {
                display: flex;
                justify-content: space-between;
                margin-top: 0.5rem;
                color: var(--color-text-secondary)
            }
            .analyticsContainer {
                display: flex;
                flex-direction: column;
            }
        `}</style>
    </div >
}

Analytics.getLayout = useDashboardLayout;