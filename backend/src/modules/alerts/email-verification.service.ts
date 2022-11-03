import { AppConfig } from '@/src/config/validate';
import { EmailService } from '@/src/core/email/email.service';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailVerificationService {
  private emailVerificationEndpoint: string;
  private from: string;

  constructor(
    private config: ConfigService<AppConfig>,
    private email: EmailService,
  ) {
    const frontendBaseUrl = this.config.get('frontend.baseUrl', {
      infer: true,
    });

    this.emailVerificationEndpoint = `${frontendBaseUrl}/alerts/verify-email`;

    this.from = this.config.get('email.alerts.noReply', {
      infer: true,
    })!;
  }

  async sendVerificationEmail(recipient: string, token: string) {
    const link = this.emailVerificationEndpoint + '?token=' + token;
    const subject = 'Pagoda Email Verification';
    const html =
      'Hello, <br><br> You are receiving this message because ' +
      'you recently created an alert destination in Pagoda. <br><br>' +
      '<a href="' +
      link +
      '">Follow this link to verify your email address.</a>' +
      '<br><br>' +
      'If you did not ask to verify this address, you can ignore this email. <br><br>' +
      'Thanks,<br>Your Pagoda Team';

    await this.email.sendMessage(this.from, [recipient], subject, html);
  }
}
