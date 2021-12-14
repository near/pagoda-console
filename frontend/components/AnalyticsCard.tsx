import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'

// chartContainer style defined locally

export default function AnalyticsCard({ chartOptions, simple }: { chartOptions?: Highcharts.Options, simple?: { label: string, value: string } }) {

    if (chartOptions?.chart?.type === 'bar') {
        return (
            <div className="chartContainer">
                <HighchartsReact
                    highcharts={Highcharts}
                    options={chartOptions}
                    containerProps={{ className: 'highchartCustomContainer' }}
                />
                <style jsx>{`
                    .chartContainer {
                        width: 100%;
                    }
                `}</style>
            </div>
        );
    } else if (chartOptions?.chart?.type === 'pie') {
        return (
            <div className="chartContainer">
                <HighchartsReact
                    highcharts={Highcharts}
                    options={chartOptions}
                    containerProps={{ className: 'highchartCustomContainer' }}
                />
            </div>
        );
    } else if (simple) {
        return <div className='chartContainer'>
            <div className="simpleContainer">
                <span className='simpleLabel'>{simple.label}</span>
                <div className="simpleValue">{simple.value}</div>
            </div>
            <style jsx>{`
                .chartContainer {
                    height: 100%;
                }
                .simpleContainer {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    width: 20rem;
                    height: 100%;
                }
                .simpleLabel {
                    font-size: 1.125rem;
                }
                .simpleValue {
                    display: flex;
                    font-size: 6rem;
                    margin: auto auto;
                }
            `}</style>
        </div>
    } else {
        throw new Error('Unknown chart type');
    }
}
