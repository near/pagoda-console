import { Test, TestingModule } from '@nestjs/testing';
import { DappController } from './dapp.controller';

describe('DappController', () => {
  let controller: DappController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DappController],
    }).compile();

    controller = module.get<DappController>(DappController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
