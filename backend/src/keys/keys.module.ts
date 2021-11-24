import { Module } from '@nestjs/common';
import { KeysService } from './keys.service';

@Module({
  providers: [KeysService],
  exports: [KeysService],
})
export class KeysModule { }