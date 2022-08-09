import { DateTime } from 'luxon';
import { PureComponent } from 'react';

class Timer extends PureComponent {
  constructor(props) {
    super(props);

    const time = props.time === undefined ? Date.now() : props.time;
    this.state = {
      time,
      timeStr: this.formatTime(time),
    };
  }

  componentDidMount() {
    this.timer = setInterval(() => this.tick(), 1000);
  }

  componentWillUnmount() {
    clearInterval(this.timer);
  }

  componentDidUpdate() {
    const time = this.props.time === undefined ? new Date() : this.props.time;
    this.setState({
      time,
      timeStr: this.formatTime(time),
    });
  }

  formatTime(time) {
    const date = DateTime.fromMillis(time);
    return date.toRelative({ style: 'short' });
  }

  tick = () => {
    this.setState(({ time }) => {
      return { timeStr: this.formatTime(time) };
    });
  };

  render() {
    return <span>{this.state.timeStr}</span>;
  }
}

export default Timer;
