import Analytics from 'analytics-node';

import config from './config';

export interface Dict {
  [key: string]: any;
}

let segment: Analytics;

function init() {
  if (segment) return console.log('Segment Analytics has already been initialized');
  //flushAt=1 is useful for testing new events
  const proxySettings =
    typeof window === 'undefined'
      ? {}
      : {
          host: `${window.location.protocol}//${window.location.host}`,
          path: '/api/segment',
        };
  const options = config.deployEnv === 'LOCAL' ? { flushAt: 1, ...proxySettings } : proxySettings;
  segment = new Analytics(config.segment, options);
}

function track(eventLabel: string, properties?: Dict) {
  segment.track({
    event: eventLabel,
    properties,
  });
}

function identify(id: string, traits: Record<string, any>) {
  segment.identify({
    traits,
    userId: id,
  });
}

async function pageView(name: string, properties?: Dict) {
  try {
    segment.page({
      name,
      properties,
    });
  } catch (e) {}
}

function reset() {
  track('Logout');
  segment.flush();
}

const fns = {
  identify,
  init,
  pageView,
  reset,
  track,
};

export default fns;
