import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import { initializeApp } from 'firebase-admin/app';
import { credential, ServiceAccount } from 'firebase-admin';
import { AppConfig } from './config/validate';
import { PromethusInterceptor } from './metrics/prometheus_interceptor';
import { Logger } from './logger/logger.service';
import { LoggingInterceptor } from './logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  const configService: ConfigService<AppConfig> = app.get(ConfigService);
  const prom = new PromethusInterceptor(configService);
  await prom.init();
  app.useGlobalInterceptors(prom);

  app.useLogger(app.get(Logger));
  app.useGlobalInterceptors(new LoggingInterceptor(app.get(Logger)));
  app.enableCors(); // TODO re-evaluate need for CORS once we have domains

  // initialize Firebase
  const sa = JSON.parse(
    configService.get('firebase.credentials', { infer: true }),
  ) as ServiceAccount;
  initializeApp({
    credential: credential.cert(sa),
  });

  await app.listen(configService.get('port', { infer: true }), '0.0.0.0');
}
bootstrap();
