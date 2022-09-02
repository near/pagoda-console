import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from '../../config/validate';
import { ApiKeysProvisioningService } from './provisioning.service';
import { ApiKeysProvisioningServiceInterface } from './interfaces';
import { ApiKeysMockProvisioningService } from './mock.provisioning.service';
import { ApiKeysService } from './apiKeys.service';
import { PrismaService } from '../prisma.service';

const apiKeysFactory = {
  provide: ApiKeysProvisioningService,
  useFactory: (
    configService: ConfigService<AppConfig>,
  ): ApiKeysProvisioningServiceInterface => {
    const useKeysServiceMock = configService.get(
      'dev.mock.rpcProvisioningService',
      {
        infer: true,
      },
    );
    if (useKeysServiceMock) {
      console.log('MOCKING KEYS SERVICE');
      return new ApiKeysMockProvisioningService();
    }
    return new ApiKeysProvisioningService(configService);
  },
  inject: [ConfigService],
};

@Module({
  providers: [apiKeysFactory, ApiKeysService, PrismaService],
  //providers: [keysFactory, apiKeysFactory, ApiKeysService, PrismaService],
  exports: [ApiKeysService],
})
export class ApiKeysModule {}
