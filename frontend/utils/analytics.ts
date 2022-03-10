import mixpanel from 'mixpanel-browser';
import config from './config';

export interface Dict {
    [key: string]: any;
}

function init() {
    // Enabling the debug mode flag is useful during implementation,
    // but it's recommended you remove it for production
    mixpanel.init(config.mixpanel.token, {
        debug: config.mixpanel.debug
    });
}

function identify(userId: string) {
    mixpanel.identify(userId);
}

function alias(id: string) {
    mixpanel.alias(id);
}

function reset() {
    mixpanel.reset();
}

function track(eventName: string, eventDetails?: Dict) {
    mixpanel.track(eventName, eventDetails);
}

const fns = {
    init,
    identify,
    alias,
    reset,
    track
};

export default fns;