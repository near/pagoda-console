import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import validate from './config/validate';
import { ConfigModule } from '@nestjs/config';
import { CoreModule } from './core/core.module';
import { ModulesModule } from './modules/modules.module';
import { LoggerModule } from 'nestjs-pino';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      // ! Be careful when adding a `.env` to the root of this project. A file named `.env` in the root will be loaded by the PrismaClient before NestJS can load it. In order to resolve this, the .env's have been separated. We've created these specific nest .env's and prisma's .env is located in `./prisma`.
      envFilePath: ['.env.nest.local', '.env.nest'],
      cache: true,
      validate,
    }),
    CoreModule,
    ModulesModule,
    LoggerModule.forRoot({
      pinoHttp: {
        transport:
          process.env.NODE_ENV?.toLowerCase() !== 'production'
            ? { target: 'pino-pretty' }
            : undefined,
      },
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
