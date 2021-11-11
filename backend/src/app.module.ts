import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { ProjectsModule } from './projects/projects.module';
import { AuthModule } from './auth/auth.module';

// TODO determine if these should be included in controllers
// and providers
// import { TeamsService } from './teams/teams.service';
// import { TeamsController } from './teams/teams.controller';
// import { UsersService } from './users/users.service';
// import { UsersController } from './users/users.controller';
// import { ProjectsService } from './projects/projects.service';
// import { ProjectsController } from './projects/projects.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    UsersModule,
    ProjectsModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
