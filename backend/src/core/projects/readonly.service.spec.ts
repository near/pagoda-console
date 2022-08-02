import { Test, TestingModule } from '@nestjs/testing';
import { ReadonlyService } from './readonly.service';

describe('ReadonlyService', () => {
  let service: ReadonlyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReadonlyService],
    }).compile();

    service = module.get<ReadonlyService>(ReadonlyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
