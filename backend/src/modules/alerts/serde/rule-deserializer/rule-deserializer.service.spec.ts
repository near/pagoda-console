import { Test, TestingModule } from '@nestjs/testing';
import { RuleDeserializerService } from './rule-deserializer.service';

describe('RuleDeserializerService', () => {
  let service: RuleDeserializerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RuleDeserializerService],
    }).compile();

    service = module.get<RuleDeserializerService>(RuleDeserializerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
