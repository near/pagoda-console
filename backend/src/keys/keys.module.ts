import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from 'src/config/validate';
import { KeysService } from './keys.service';
import { MockKeysService } from './mock.keys.service';

const keysFactory = {
  provide: KeysService,
  useFactory: (configService: ConfigService<AppConfig>) => {
    const useKeysServiceMock = configService.get('dev.mock.rpcAuth', {
      infer: true,
    });
    if (useKeysServiceMock) {
      console.log('MOCKING KEYS SERVICE');
      return new MockKeysService(configService);
    }
    return new KeysService(configService);
  },
  inject: [ConfigService],
};

@Module({
  providers: [keysFactory],
  exports: [KeysService],
})
export class KeysModule {}
