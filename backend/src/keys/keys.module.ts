import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { KeysService } from './keys.service';
import { MockKeysService } from './mock.keys.service';

const keysFactory = {
  provide: KeysService,
  useFactory: (configService: ConfigService) => {
    const useKeysServiceMock =
      configService.get<string>('MOCK_KEY_SERVICE') === 'true';
    if (useKeysServiceMock) {
      console.log('MOCKING KEYS SERVICE');
      return new MockKeysService();
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
