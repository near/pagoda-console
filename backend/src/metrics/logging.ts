import { RequestHandler } from 'express-serve-static-core';
import {
  collectDefaultMetrics,
  Counter,
  Histogram,
  Registry,
} from 'prom-client';

type OnRequestMessage = {
  method: string;
  path: string;
};

type OnResponseMessage = OnRequestMessage & {
  statusCode: string | number;
  duration: number;
};

export const createLogging = async (registry: Registry) => {
  collectDefaultMetrics({
    register: registry,
  });
  const httpRequestCount = new Counter({
    registers: [registry],
    name: 'nodejs_http_req_total_count',
    help: 'total request number',
    labelNames: ['method', 'path'],
  });
  const httpResponseCount = new Counter({
    registers: [registry],
    name: 'nodejs_http_res_total_count',
    help: 'total response number',
    labelNames: ['method', 'path', 'statusCode'],
  });
  const httpRequestDurationMicroseconds = new Histogram({
    registers: [registry],
    name: 'http_request_duration_ms',
    help: 'Duration of HTTP requests in ms',
    labelNames: ['method', 'path', 'statusCode'],
    buckets: [0.1, 5, 15, 50, 100, 200, 300, 400, 500],
  });
  return {
    onRequest: ({ method, path }: OnRequestMessage) => {
      httpRequestCount.labels(method, path).inc();
    },
    onResponse: ({ method, path, statusCode, duration }: OnResponseMessage) => {
      httpRequestDurationMicroseconds
        .labels(method, path, statusCode.toString())
        .observe(duration);
      httpResponseCount.labels(method, path, statusCode.toString()).inc();
    },
  };
};

export const getMetricsHandler =
  (registry: Registry): RequestHandler =>
  async (_req, res, next) => {
    try {
      res.setHeader('content-type', registry.contentType);
      const metrics = await registry.metrics();
      res.send(metrics);
    } catch (error) {
      return next(error);
    }
  };
