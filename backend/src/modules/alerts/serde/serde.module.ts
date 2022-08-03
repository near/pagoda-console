import { Module } from '@nestjs/common';
import { RuleSerializerService } from './rule-serializer/rule-serializer.service';
import { RuleDeserializerService } from './rule-deserializer/rule-deserializer.service';

@Module({
  providers: [RuleSerializerService, RuleDeserializerService],
  exports: [RuleSerializerService, RuleDeserializerService],
})
export class SerdeModule {}
