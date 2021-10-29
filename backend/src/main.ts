import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import { initializeApp } from 'firebase-admin/app';
import { credential, ServiceAccount } from 'firebase-admin';
// import serviceAccount from '../near-dev-platform-firebase-adminsdk-7zimk-2208813638.json';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors(); // TODO re-evaluate need for CORS once we have domains

  const configService = app.get(ConfigService);

  // initialize Firebase

  // initializeApp({
  //   credential: credential.cert(serviceAccount as ServiceAccount),
  // });
  // console.log(configService.get('FIREBASE_CREDENTIALS'));
  const sa = JSON.parse(
    configService.get('FIREBASE_CREDENTIALS'),
  ) as ServiceAccount;
  initializeApp({
    credential: credential.cert(sa),
  });

  await app.listen(configService.get('PORT'));
}
bootstrap();
