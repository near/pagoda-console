import { captureException, withSentry } from '@sentry/nextjs';
import type { NextApiHandler } from 'next';
import * as url from 'url';

const sentryHost = 'sentry.io';

// The list of Sentry project IDs which we want to accept through this proxy.
const knownProjectIds = ['6632556'];

const handler: NextApiHandler = async (req, res) => {
  try {
    const envelope = req.body;
    const pieces = envelope.split('\n');

    const header = JSON.parse(pieces[0]);

    const { host, path } = url.parse(header.dsn);
    if (!host || !host.endsWith(sentryHost)) {
      throw new Error(`Invalid host: ${host}`);
    }
    if (!path) {
      throw new Error(`DNS doesn't include path`);
    }

    const projectId = path.replace(/\//g, '');
    if (!knownProjectIds.includes(projectId)) {
      throw new Error(`Invalid project id: ${projectId}`);
    }

    const response = await fetch(`https://${sentryHost}/api/${projectId}/envelope/`, {
      method: 'POST',
      body: envelope,
    });
    const json = await response.json();
    return res.status(response.status).json(json);
  } catch (e) {
    captureException(e);
    return res.status(400).json({ status: 'Invalid request' });
  }
};

export default withSentry(handler);
