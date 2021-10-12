import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { DappModule } from './dapp/dapp.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    UserModule,
    DappModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
