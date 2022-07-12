import { Module } from '@nestjs/common';
import { EmailsService } from './emails.service';

@Module({
  providers: [EmailsService],
})
export class EmailsModule {}
