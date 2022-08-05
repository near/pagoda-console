import Analytics from 'analytics-node';
import { uniqueId } from 'lodash-es';

import config from './config';

export interface Dict {
  [key: string]: any;
}

let segment: Analytics;
let userId: string;
const anonymousId = uniqueId();

function init() {
  if (segment) return console.log('Segment Analytics has already been initialized');
  //flushAt=1 is useful for testing new events
  const options = config.deployEnv === 'LOCAL' ? { flushAt: 1 } : {};
  segment = new Analytics(config.segment, options);
}

function alias(id: string) {
  userId = id;
  segment.alias({
    previousId: userId || anonymousId,
    userId,
  });
}

function track(eventLabel: string, properties?: Dict) {
  const id = userId ? { userId } : { anonymousId };
  segment.track({
    ...id,
    event: eventLabel,
    properties,
  });
}

function identify(id: string) {
  userId = id;
  segment.identify({
    userId,
  });
}

function pageView(name: string, properties?: Dict) {
  segment.page({
    userId,
    anonymousId,
    name,
    properties,
  });
}

function reset() {
  segment.flush();
  track('Logout');
}

const fns = {
  alias,
  identify,
  init,
  pageView,
  reset,
  track,
};

export default fns;
