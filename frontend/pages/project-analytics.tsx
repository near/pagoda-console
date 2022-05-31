import Highcharts from 'highcharts';
import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useState } from 'react';
import { useEffect } from 'react';

import { AnalyticsCard } from '@/components/AnalyticsCard';
import { Box } from '@/components/lib/Box';
import { Container } from '@/components/lib/Container';
import { Flex } from '@/components/lib/Flex';
import { Font } from '@/components/lib/Font';
import { H3 } from '@/components/lib/Heading';
import { P } from '@/components/lib/Paragraph';
import { Section } from '@/components/lib/Section';
import { Spinner } from '@/components/lib/Spinner';
import { TextLink } from '@/components/lib/TextLink';
import { useDashboardLayout } from '@/hooks/layouts';
import { useSelectedProject } from '@/hooks/selected-project';
import { useIdentity } from '@/hooks/user';
import AnalyticsPreview from '@/public/analyticsPreview.png';
import { getUserData, updateUserData } from '@/utils/cache';
import config from '@/utils/config';
import { authenticatedPost } from '@/utils/http';
import type { NetOption, NetUsageData, UsageData } from '@/utils/types';
import type { NextPageWithLayout } from '@/utils/types';

const ProjectAnalytics: NextPageWithLayout = () => {
  const identity = useIdentity();
  const [usageData, setUsageData] = useState<UsageData | null>();
  const [methodBreakdownChartOptions, setMethodBreakdownChartOptions] = useState<Highcharts.Options>();
  const [responseCodeChartOptions, setResponseCodeChartOptions] = useState<Highcharts.Options>();
  const { environment, project } = useSelectedProject();
  // TODO (P2+) determine net by other means than subId
  const net: NetOption = environment?.subId === 2 ? 'MAINNET' : 'TESTNET';

  useEffect(() => {
    Highcharts.setOptions({
      chart: {
        style: {
          fontFamily: 'NB International Pro, sans-serif',
        },
      },
    });
  }, []);

  const processUsageChunk = useCallback(
    async (
      usageDataRaw: string,
      keys: Record<NetOption, Array<string>>,
      usage: UsageData,
      start: number,
    ): Promise<{ start: number; usage: UsageData }> => {
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
          for (const currentNet in keys) {
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
              const { status_code } = event.properties;

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
    },
    [],
  );

  const loadUsageData = useCallback(
    async (uid: string, project: string, net: NetOption, usageData?: UsageData) => {
      if (usageData) {
        const previouslyFetchedAt = new Date(usageData.fetchedAt);
        const difference = new Date().valueOf() - previouslyFetchedAt.valueOf();
        if (difference > config.usagePersistenceMinutes * 60 * 1000) {
          usageData = undefined;
        }
      }

      if (!usageData) {
        // fetch from API
        const { events: usage, keys } = await authenticatedPost('/projects/getRpcUsage', { project });

        // initialize
        usageData = {
          nets: {
            MAINNET: {
              methods: {},
              responseCodes: {},
              calls: 0,
            },
            TESTNET: {
              methods: {},
              responseCodes: {},
              calls: 0,
            },
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
    },
    [processUsageChunk],
  );

  useEffect(() => {
    // clear currently loaded data
    setUsageData(undefined);

    if (!project || !identity) return;

    const cachedUserData = getUserData(identity.uid);
    loadUsageData(identity.uid, project.slug, net, cachedUserData?.usageData?.[project.slug]);
  }, [project, loadUsageData, identity, net]);

  // TODO (P2+) extract to specialized component
  function getMethodChartOptions(methodBreakdown: NetUsageData['methods']) {
    if (methodBreakdown) {
      const options: Highcharts.Options = {
        title: {
          text: 'Calls by Method',
        },
        chart: {
          type: 'bar',
          // backgroundColor: 'transparent',
        },
        yAxis: {
          title: {
            text: 'Method Calls',
          },
        },
        xAxis: {
          categories: Object.keys(methodBreakdown),
        },
        legend: {
          enabled: false,
        },
        exporting: {
          enabled: false,
        },
        series: [
          {
            type: 'bar',
            name: 'Method Calls',
            data: Object.keys(methodBreakdown).map((method) => methodBreakdown![method]),
            color: '#5F8AFA', // NEAR accent blue
          },
        ],
      };
      return options;
    }
  }

  function getResponseChartOptions(responseCodes: NetUsageData['responseCodes']) {
    const options: Highcharts.Options = {
      title: {
        text: 'Service Response Codes',
      },
      chart: {
        type: 'pie',
        backgroundColor: 'transparent',
      },
      exporting: {
        enabled: false,
      },
      series: [
        {
          name: 'Response Codes',
          type: 'pie',
          data: Object.keys(responseCodes).map((code) => ({
            name: code,
            y: responseCodes[code],
            ...(code === '200' ? { color: '#AAD055' } : {}),
          })),
        },
      ],
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
    content = (
      <Section>
        <Flex stack gap="l">
          <Box
            css={{
              width: '100%',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gridTemplateRows: 'auto',
              columnGap: 'var(--space-l)',
              rowGap: 'var(--space-l)',
              gridTemplateAreas: "'primary primary' 'secondary tertiary'",
            }}
          >
            {methodBreakdownChartOptions && (
              <Box css={{ gridArea: 'primary' }}>
                <AnalyticsCard chartOptions={methodBreakdownChartOptions} />
              </Box>
            )}
            <Box css={{ gridArea: 'secondary' }}>
              <AnalyticsCard simple={{ label: 'Calls', value: formatTotalCalls(usageData.nets[net].calls) }} />
            </Box>
            {responseCodeChartOptions && Object.keys(usageData.nets[net].responseCodes).length > 0 && (
              <Box css={{ gridArea: 'tertiary' }}>
                <AnalyticsCard chartOptions={responseCodeChartOptions} />
              </Box>
            )}
          </Box>

          <LastFetchedInfo fetchedAt={usageData.fetchedAt} />
        </Flex>
      </Section>
    );
  } else if (usageData === undefined) {
    // loading
    content = (
      <Section>
        <Flex align="center">
          <Spinner />
          <P>Fetching RPC usage data. This may take a few seconds.</P>
        </Flex>
      </Section>
    );
  } else {
    content = <AnalyticsEmptyState fetchedAt={usageData?.fetchedAt} />;
  }

  return content;
};

function AnalyticsEmptyState({ fetchedAt }: { fetchedAt?: string }) {
  return (
    <Section>
      <Container size="m">
        <Flex stack gap="l">
          <H3>&#128075; Welcome to your new project</H3>

          <Flex gap="l" align="center">
            <Box css={{ width: '50%' }}>
              <Image src={AnalyticsPreview} alt="Preview of populated analytics page" />
            </Box>

            <Flex stack css={{ width: '50%' }}>
              <P>
                Follow the instructions on the{' '}
                <Link href="/project-settings" passHref>
                  <TextLink>Project Settings</TextLink>
                </Link>{' '}
                page (&#34;Settings&#34; in the navbar) to get started with making requests to the NEAR RPC service.
              </P>
              <P>Once you make some requests you’ll see usage data populate here.</P>
            </Flex>
          </Flex>

          {fetchedAt && <LastFetchedInfo fetchedAt={fetchedAt} />}
        </Flex>
      </Container>
    </Section>
  );
}

function LastFetchedInfo({ fetchedAt }: { fetchedAt: string }) {
  return (
    <Flex justify="spaceBetween">
      <Font color="text3">Last updated at: {new Date(fetchedAt).toLocaleString()}</Font>
      <Font color="text3">Data may be fetched once per hour</Font>
    </Flex>
  );
}

ProjectAnalytics.getLayout = useDashboardLayout;

export default ProjectAnalytics;
