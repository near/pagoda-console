import { Module } from '@nestjs/common';
import { ExplorerController } from './explorer.controller';
import { ExplorerService } from './explorer.service';

@Module({
  providers: [ExplorerService],
  controllers: [ExplorerController],
  exports: [ExplorerService],
})
export class ExplorerModule {}
