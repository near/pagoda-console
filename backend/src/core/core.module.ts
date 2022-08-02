import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { ProjectsModule } from './projects/projects.module';
import { AuthModule } from './auth/auth.module';
import validate from '../config/validate';

import { KeysService } from './keys/keys.service';
import { KeysModule } from './keys/keys.module';
import { IndexerService } from './indexer.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      // ! Be careful when adding a `.env` to the root of this project. A file named `.env` in the root will be loaded by the PrismaClient before NestJS can load it. In order to resolve this, the .env's have been separated. We've created these specific nest .env's and prisma's .env is located in `./src/core/prisma`.
      envFilePath: ['.env.nest.local', '.env.nest'],
      cache: true,
      validate,
    }),
    UsersModule,
    ProjectsModule,
    AuthModule,
    KeysModule,
  ],
  providers: [KeysService, IndexerService],
})
export class CoreModule {}
