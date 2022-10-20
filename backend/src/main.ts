import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import { initializeApp } from 'firebase-admin/app';
import {
  initializeApp as clientInitializeApp,
  FirebaseOptions,
} from 'firebase/app';
import { credential, ServiceAccount } from 'firebase-admin';
import { AppConfig } from './config/validate';
import { PromethusInterceptor } from './metrics/prometheus_interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors(); // TODO re-evaluate need for CORS once we have domains
  const configService: ConfigService<AppConfig> = app.get(ConfigService);
  const prom = new PromethusInterceptor(configService);
  await prom.init();
  app.useGlobalInterceptors(prom);

  // initialize Firebase admin
  const sa = JSON.parse(
    configService.get('firebase.credentials', { infer: true }),
  ) as ServiceAccount;
  initializeApp({
    credential: credential.cert(sa),
  });
  // initialize Firebase client
  const firebaseClientConfig = JSON.parse(
    configService.get('firebase.clientConfig', { infer: true }),
  ) as FirebaseOptions;
  clientInitializeApp(firebaseClientConfig);

  await app.listen(configService.get('port', { infer: true }), '0.0.0.0');
}
bootstrap();
