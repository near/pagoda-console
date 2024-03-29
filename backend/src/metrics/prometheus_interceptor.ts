import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Registry } from 'prom-client';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AppConfig } from '../config/validate';
import { createLogging, getMetricsHandler } from './logging';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const express = require('express');

@Injectable()
export class PromethusInterceptor implements NestInterceptor {
  static server;
  config: ConfigService<AppConfig>;
  logger!: {
    onRequest: ({ method, path }: { method: string; path: string }) => void;
    onResponse: ({
      method,
      path,
      statusCode,
      duration,
    }: { method: string; path: string } & {
      statusCode: string | number;
      duration: number;
    }) => void;
  };
  static registry: Registry;

  constructor(config: ConfigService<AppConfig>) {
    this.config = config;
  }

  async init() {
    PromethusInterceptor.registry = new Registry();
    PromethusInterceptor.registry.setDefaultLabels({
      job: 'pagoda-console',
      envrionment: this.config.get('deployEnv', {
        infer: true,
      }),
    });
    this.logger = await createLogging(PromethusInterceptor.registry);
    const app = express();
    app.use('/metrics', getMetricsHandler(PromethusInterceptor.registry));
    const port = this.config.get('metricsPort', {
      infer: true,
    });
    PromethusInterceptor.server = app.listen(port);
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // keep in mind that process time incurred due to Guards and any Middleware
    // will not be accounted for. More info @ https://docs.nestjs.com/faq/request-lifecycle
    const startTimestamp = Date.now();

    const httpContext = context.switchToHttp();
    const { method, originalUrl: path } = httpContext.getRequest();

    this.logger.onRequest({ method, path });

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - startTimestamp;
        const { statusCode } = httpContext.getResponse();
        this.logger.onResponse({
          method,
          path,
          statusCode,
          duration,
        });
      }),
    );
  }
}

process.on('SIGTERM', async () => {
  try {
    await PromethusInterceptor.server.close();
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
});
