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
  //flushAt=1 is useful for testing events,
  //TODO switch this to enable: false to prevent recording events from local development
  const options = config.segment.debug ? { flushAt: 1 } : {};
  console.log('intitializing segment w/ %s', options);
  segment = new Analytics(config.segment.key, options);
}

function alias() {
  segment.alias({
    previousId: anonymousId,
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
