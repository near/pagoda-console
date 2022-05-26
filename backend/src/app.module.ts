import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { ProjectsModule } from './projects/projects.module';
import { AuthModule } from './auth/auth.module';
import validate from './config/validate';

// TODO determine if these should be included in controllers
// and providers
// import { TeamsService } from './teams/teams.service';
// import { TeamsController } from './teams/teams.controller';
// import { UsersService } from './users/users.service';
// import { UsersController } from './users/users.controller';
// import { ProjectsService } from './projects/projects.service';
// import { ProjectsController } from './projects/projects.controller';
import { KeysService } from './keys/keys.service';
import { KeysModule } from './keys/keys.module';
import { IndexerService } from './indexer.service';
import { AlertsModule } from './alerts/alerts.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      // ! Be careful when adding a `.env` to the root of this project. A file named `.env` in the root will be loaded by the PrismaClient before NestJS can load it. In order to resolve this, the .env's have been separated. We've created these specific nest .env's and prisma's .env is located in `./prisma`.
      envFilePath: ['.env.nest.local', '.env.nest'],
      cache: true,
      validate,
    }),
    UsersModule,
    ProjectsModule,
    AuthModule,
    KeysModule,
    AlertsModule,
  ],
  controllers: [AppController],
  providers: [AppService, KeysService, IndexerService],
})
export class AppModule {}
