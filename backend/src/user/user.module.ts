import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { PrismaService } from '../prisma.service';
import { UserController } from './user.controller';

@Module({
  providers: [UserService, PrismaService],
  imports: [PrismaService],
  exports: [UserService],
  controllers: [UserController],
})
export class UserModule {}
