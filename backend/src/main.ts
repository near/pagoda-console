import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors(); // TODO re-evaluate need for CORS once we have domains

  const configService = app.get(ConfigService);
  await app.listen(configService.get('PORT'));
}
bootstrap();
