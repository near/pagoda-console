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

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      validate,
    }),
    UsersModule,
    ProjectsModule,
    AuthModule,
    KeysModule,
  ],
  controllers: [AppController],
  providers: [AppService, KeysService, IndexerService],
})
export class AppModule {}
