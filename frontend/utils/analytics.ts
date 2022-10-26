import Analytics from 'analytics-node';
import { v4 as uuid } from 'uuid';

import config from './config';

interface Properties {
  [key: string]: any;
}

let segment: Analytics;
let userId: string;
let anonymousUserId: string;

function init() {
  if (segment) return console.log('Segment Analytics has already been initialized');

  const proxySettings =
    typeof window === 'undefined'
      ? {}
      : {
          host: `${window.location.protocol}//${window.location.host}`,
          path: '/api/segment',
        };

  const options = {
    ...proxySettings,
    flushAt: config.deployEnv === 'LOCAL' ? 1 : undefined, // flushAt=1 is useful for testing new events
  };

  segment = new Analytics(config.segment, options);
}

function track(eventLabel: string, properties?: Properties) {
  const id = userId ? { userId } : { anonymousId: anonymousUserId };
  segment.track({
    ...id,
    event: eventLabel,
    properties,
  });
}

function identify(id: string, traits: Record<string, any>) {
  userId = id;
  segment.identify({
    traits,
    userId,
  });
}

function pageView(name: string, properties?: Properties) {
  const id = userId ? { userId } : { anonymousId: anonymousUserId };
  segment.page({
    ...id,
    name,
    properties,
  });
}

function reset() {
  track('Logout');
  segment.flush();
}

function setAnonymousId() {
  if (anonymousUserId) {
    return;
  }
  const storageId: string | null = localStorage.getItem('anonymousUserId');
  if (storageId) {
    anonymousUserId = storageId;
  } else {
    anonymousUserId = uuid();
    localStorage.setItem('anonymousUserId', anonymousUserId);
  }
}

const fns = {
  identify,
  init,
  pageView,
  reset,
  setAnonymousId,
  track,
};

export default fns;
