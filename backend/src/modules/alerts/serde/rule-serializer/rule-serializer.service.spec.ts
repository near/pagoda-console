import { Test, TestingModule } from '@nestjs/testing';
import { RuleSerializerService } from './rule-serializer.service';

describe('RuleSerializerService', () => {
  let service: RuleSerializerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RuleSerializerService],
    }).compile();

    service = module.get<RuleSerializerService>(RuleSerializerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
