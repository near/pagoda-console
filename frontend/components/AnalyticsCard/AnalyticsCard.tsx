import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

import { Flex } from '../lib/Flex';
import { Text } from '../lib/Text';
import * as S from './styles';

export function AnalyticsCard({
  chartOptions,
  simple,
}: {
  chartOptions?: Highcharts.Options;
  simple?: { label: string; value: string };
}) {
  if (chartOptions?.chart?.type === 'bar') {
    return (
      <S.Card css={{ width: '100%' }}>
        <HighchartsReact
          highcharts={Highcharts}
          options={chartOptions}
          containerProps={{ className: 'highchartCustomContainer' }}
        />
      </S.Card>
    );
  } else if (chartOptions?.chart?.type === 'pie') {
    return (
      <S.Card>
        <HighchartsReact
          highcharts={Highcharts}
          options={chartOptions}
          containerProps={{ className: 'highchartCustomContainer' }}
        />
      </S.Card>
    );
  } else if (simple) {
    return (
      <S.Card css={{ height: '100%', background: 'var(--color-surface-1)', display: 'flex', alignItems: 'center' }}>
        <Flex as="p" stack align="center">
          <Text as="span" color="text1" size="h5">
            {simple.label}
          </Text>
          <Text as="span" color="text1" size="h1">
            {simple.value}
          </Text>
        </Flex>
      </S.Card>
    );
  } else {
    throw new Error('Unknown chart type');
  }
}
