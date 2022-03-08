import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import { initializeApp } from 'firebase-admin/app';
import { credential, ServiceAccount } from 'firebase-admin';
import { AppConfig } from './config/validate';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors(); // TODO re-evaluate need for CORS once we have domains

  // TODO remove these after testing config file loading
  // use a non-typed config object to access arbitrary environment variables
  // const genericConfigService: ConfigService = app.get(ConfigService);
  // console.log(genericConfigService.get('PRIORITY_ENV_FILE'));

  const configService: ConfigService<AppConfig> = app.get(ConfigService);
  console.log(
    `Launching w/ deploy env: ${configService.get('deployEnv', {
      infer: true,
    })}`,
  );

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
