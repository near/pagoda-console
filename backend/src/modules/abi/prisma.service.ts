import { INestApplication, Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@pc/database/clients/abi';
import { AppConfig } from '@/src/config/validate';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor(private config: ConfigService<AppConfig>) {
    super({
      log: config.get('log.queries', { infer: true })
        ? ['query', 'info', 'warn', 'error']
        : ['info', 'warn', 'error'],
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async enableShutdownHooks(app: INestApplication) {
    this.$on('beforeExit', async () => {
      await app.close();
    });
  }
}
