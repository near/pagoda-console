import type { NextPage } from 'next';
import dynamic from "next/dynamic";
import { Button } from 'react-bootstrap';
import { useRouter } from 'next/router';
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
import { NetOption, NetUsageData, UsageData } from '../utils/interfaces';
import { useEffect } from 'react';
import Highcharts from 'highcharts';
import BorderSpinner from '../components/BorderSpinner';
import AnalyticsCard from '../components/AnalyticsCard';
import { getUserData, updateUserData } from '../utils/cache';
import config from '../utils/config';
import PageLink from '../components/PageLink';


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
    let [usageData, setUsageData] = useState<UsageData | null>();

    const [methodBreakdownChartOptions, setMethodBreakdownChartOptions] = useState<Highcharts.Options>();
    const [responseCodeChartOptions, setResponseCodeChartOptions] = useState<Highcharts.Options>();

    const projectSlug = useRouteParam('project');
    // TODO (P2+) determine net by other means than subId
    const environmentSubIdRaw = useRouteParam('environment');
    const environmentSubId = typeof environmentSubIdRaw === 'string' ? parseInt(environmentSubIdRaw) : null;
    const net: NetOption = environmentSubId === 2 ? 'MAINNET' : 'TESTNET';

    const processUsageChunk = useCallback(async (usageDataRaw: string, keys: Record<NetOption, Array<string>>, usage: UsageData, start: number): Promise<{ start: number, usage: UsageData; }> => {
        let processed = 0;
        for (let i = start; i < usageDataRaw.length && processed < 10; i++) {
            if (usageDataRaw[i] === '\n') {
                const eventRaw = usageDataRaw.substring(start, i);
                start = i + 1;
                processed++;

                const event = JSON.parse(eventRaw);

                let net: NetOption | null = null;
                if (!event?.properties?.distinct_id) {
                    // could not identify environment
                    continue;
                }
                for (let currentNet in keys) {
                    if (keys[currentNet as NetOption].includes(event.properties.distinct_id)) {
                        net = currentNet as NetOption;
                        break;
                    }
                }
                if (!net) {
                    // could not identify environment
                    continue;
                }

                switch (event.event) {
                    case 'request':
                        let requestBody = event.properties.body;

                        if (typeof requestBody === 'string') {
                            try {
                                requestBody = JSON.parse(requestBody);
                            } catch {
                                // not prepared to handle strings that aren't json
                                requestBody = null;
                            }
                        }

                        // if we do not have a request body that we can extract meaningful data from, then
                        // we will default to an empty object so we can at least count this call in the charts
                        if (!requestBody) {
                            requestBody = {};
                        }

                        //calls for this method
                        let { method } = requestBody;

                        switch (method) {
                            case 'query':
                                method = `query/${requestBody.params.request_type}`;
                                break;
                            case 'block':
                                // TODO (P2+) make this handle params dynamically so it wont break if rpc is updated
                                if (requestBody.params) {
                                    method = `block/${requestBody.params.finality ? 'finality' : 'block_id'}`;
                                }
                                break;
                            case undefined:
                                method = 'N/A';
                                break;
                            default:
                                break;
                        }

                        if (!usage.nets[net].methods[method]) {
                            usage.nets[net].methods[method] = 1;
                        } else {
                            usage.nets[net].methods[method]++;
                        }

                        // total calls
                        usage.nets[net].calls++;
                        break;
                    case 'response':
                        let { status_code } = event.properties;

                        // DEBUGGING - view all codes in pie chart
                        // if (Math.random() > 0.8) {
                        //     status_code = '403'
                        // } else if (Math.random() > 0.6) {
                        //     status_code = '400'
                        // }

                        if (!usage.nets[net].responseCodes[status_code]) {
                            usage.nets[net].responseCodes[status_code] = 1;
                        } else {
                            usage.nets[net].responseCodes[status_code]++;
                        }
                        break;
                    default:
                        break;
                }
            }
        }
        return { start, usage };
    }, []);

    const loadUsageData = useCallback(async (uid: string, project: string, net: NetOption, usageData?: UsageData) => {
        if (usageData) {
            const previouslyFetchedAt = new Date(usageData.fetchedAt);
            const difference = new Date().valueOf() - previouslyFetchedAt.valueOf();
            if (difference > config.usagePersistenceMinutes * 60 * 1000) {
                usageData = undefined;
            }
        }

        if (!usageData) {
            // fetch from API
            let { events: usage, keys } = await authenticatedPost('/projects/getRpcUsage', { project });

            // initialize
            usageData = {
                nets: {
                    'MAINNET': {
                        methods: {},
                        responseCodes: {},
                        calls: 0
                    },
                    'TESTNET': {
                        methods: {},
                        responseCodes: {},
                        calls: 0
                    }
                },
                fetchedAt: new Date().toISOString(),
            };

            if (usage) {
                let start = 0;
                while (start < usage.length) {
                    const { start: newStart } = await processUsageChunk(usage, keys, usageData, start);
                    start = newStart;
                }
            }


            updateUserData(uid, { usageData: { [project]: usageData } });
        }

        setUsageData(usageData as UsageData);
        setMethodBreakdownChartOptions(getMethodChartOptions(usageData.nets[net].methods!));
        setResponseCodeChartOptions(getResponseChartOptions(usageData.nets[net].responseCodes!));
    }, [processUsageChunk]);

    useEffect(() => {
        // clear currently loaded data
        setUsageData(undefined);

        if (projectSlug && identity) {
            const cachedUserData = getUserData(identity.uid);
            loadUsageData(identity.uid, projectSlug, net, cachedUserData?.usageData?.[projectSlug]);
        }
    }, [projectSlug, loadUsageData, identity, net]);


    // TODO (P2+) extract to specialized component
    function getMethodChartOptions(methodBreakdown: NetUsageData['methods']) {
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

    function getResponseChartOptions(responseCodes: NetUsageData['responseCodes']) {
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

    let content;
    if (usageData && net && usageData.nets[net].calls > 0) {
        content = <div className='analyticsContainer'>
            <div className="usageCards">
                {methodBreakdownChartOptions && <div className="primary">
                    <AnalyticsCard
                        chartOptions={methodBreakdownChartOptions}
                    />
                </div>}
                <div className="secondary">
                    <AnalyticsCard simple={{ label: 'Calls', value: formatTotalCalls(usageData.nets[net].calls) }} />
                </div>
                {responseCodeChartOptions && Object.keys(usageData.nets[net].responseCodes).length > 0 && <div className="tertiary">
                    <AnalyticsCard
                        chartOptions={responseCodeChartOptions}
                    />
                </div>}
            </div>
            <LastFetchedInfo fetchedAt={usageData.fetchedAt} />
            <style jsx>{`
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
                .analyticsContainer {
                    display: flex;
                    flex-direction: column;
                }
            `}</style>
        </div>;
    } else if (usageData === undefined) {
        // loading
        content = <div className='rpcLoading'>
            <div className='spinnerContainer'><BorderSpinner /></div>
            Fetching RPC usage data. This may take a few seconds.
            <style jsx>{`
                .rpcLoading {
                    display: flex;
                    flex-direction: row;
                    align-items: center;
                    margin-top: 1rem;
                }
                .spinnerContainer {
                    margin-right: 1rem;
                }
            `}</style>
        </div>;
    } else {
        content = <AnalyticsEmptyState fetchedAt={usageData?.fetchedAt} />;
    }


    return <div>
        <div className='pageContainer'>
            <ProjectSelector />
            {content}
        </div>
        <style jsx>{`
            .pageContainer {
            display: flex;
            flex-direction: column;
            }
        `}</style>
    </div >;
}

function AnalyticsEmptyState({ fetchedAt }: { fetchedAt?: string; }) {
    return (
        <div className='emptyStateWrapper'>
            <h3 className='welcomeText'>&#128075; Welcome to your new project</h3>
            <div className='emptyStateContainer'>
                <div className='imageContainer'>
                    <Image src={AnalyticsPreview} alt='Preview of populated analytics page' />
                </div>
                <div className='onboarding'>
                    <div className='onboardingText'>
                        <p>Follow the instructions on the <PageLink route='/project-settings'>Project Settings screen</PageLink> (&#34;Settings&#34; in the navbar) to get started with making requests to the NEAR RPC service.</p>
                        <span>Once you make some requests you’ll see usage data populate here.</span>
                    </div>
                </div>
            </div>
            {fetchedAt && <LastFetchedInfo fetchedAt={fetchedAt} />}
            <style jsx>{`
                .emptyStateContainer {
                    display: flex;
                    flex-direction: row;
                    column-gap: 1.5rem;
                    align-items: center;
                }
                .imageContainer, .onboarding {
                    width: 50%;
                }
                .welcomeText {
                        margin-top: 2rem;
                }
                .onboardingText {
                    margin-bottom: 3rem;
                }
                .boldText {
                    font-weight: 700;
                }
              .emptyStateWrapper {
                  display: flex;
                  flex-direction: column;
                  row-gap: 1.5rem;
              }
            `}</style>
        </div>
    );
}

function LastFetchedInfo({ fetchedAt }: { fetchedAt: string; }) {
    return (
        <div className="lastUpdated">
            <span>Last updated at: {new Date(fetchedAt).toLocaleString()}</span>
            <span>Data may be fetched once per hour</span>
            <style jsx>{`
                .lastUpdated {
                    display: flex;
                    justify-content: space-between;
                    margin-top: 0.5rem;
                    color: var(--color-text-secondary)
                }
            `}</style>
        </div>
    );
}

Analytics.getLayout = useDashboardLayout;