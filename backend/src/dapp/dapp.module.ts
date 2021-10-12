import { Module } from '@nestjs/common';
import { DappService } from './dapp.service';
import { DappController } from './dapp.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  providers: [DappService, PrismaService], // TODO check that this is the right way to import
  controllers: [DappController],
  imports: [PrismaService],
})
export class DappModule {}
