import { AppConfig } from '@/src/config/validate';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmailService } from './email.service';
import { EmailServiceInterface } from './interfaces';
import { MockEmailService } from './mock.email.service';

const emailFactory = {
  provide: EmailService,
  useFactory: (
    configService: ConfigService<AppConfig>,
  ): EmailServiceInterface => {
    const useMock = configService.get('dev.mock.email', {
      infer: true,
    });
    if (useMock) {
      console.log('MOCKING EMAIL SERVICE');
      return new MockEmailService();
    }
    return new EmailService(configService);
  },
  inject: [ConfigService],
};

@Module({
  providers: [emailFactory],
  exports: [EmailService],
})
export class EmailModule {}
