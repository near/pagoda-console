import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

import { Flex } from '../lib/Flex';
import { Font } from '../lib/Font';
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
          <Font size="h5">{simple.label}</Font>
          <Font size="h1">{simple.value}</Font>
        </Flex>
      </S.Card>
    );
  } else {
    throw new Error('Unknown chart type');
  }
}
