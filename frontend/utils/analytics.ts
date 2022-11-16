import Analytics from 'analytics-node';
import { nanoid } from 'nanoid';

import config from './config';

interface Properties {
  [key: string]: any;
}

let segment: Analytics;
let userId: string;
let anonymousUserId: string;

function getAnonymousId() {
  if (anonymousUserId) {
    return anonymousUserId;
  }

  const storageId: string | null = localStorage.getItem('anonymousUserId');

  if (storageId) {
    anonymousUserId = storageId;
  } else {
    anonymousUserId = nanoid();
    localStorage.setItem('anonymousUserId', anonymousUserId);
  }

  return anonymousUserId;
}

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
  try {
    const id = userId ? { userId } : { anonymousId: getAnonymousId() };
    segment.track({
      ...id,
      event: eventLabel,
      properties,
    });
  } catch (e) {
    console.error(e);
  }
}

function identify(id: string, traits: Record<string, any>) {
  try {
    userId = id;
    segment.identify({
      traits,
      userId,
    });
  } catch (e) {
    console.error(e);
  }
}

function pageView(name: string, properties?: Properties) {
  try {
    const id = userId ? { userId } : { anonymousId: getAnonymousId() };
    segment.page({
      ...id,
      name,
      properties,
    });
  } catch (e) {
    console.error(e);
  }
}

function reset() {
  try {
    track('Logout');
    segment.flush();
  } catch (e) {
    console.error(e);
  }
}

const fns = {
  identify,
  init,
  pageView,
  reset,
  track,
};

export default fns;
