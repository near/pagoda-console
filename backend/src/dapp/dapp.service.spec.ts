import { Test, TestingModule } from '@nestjs/testing';
import { DappService } from './dapp.service';

describe('DappService', () => {
  let service: DappService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DappService],
    }).compile();

    service = module.get<DappService>(DappService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
