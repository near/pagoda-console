import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Mailgun from 'mailgun.js';
import Client from 'mailgun.js/client';
import { AppConfig } from 'src/config/validate';
import { VError } from 'verror';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const formData = require('form-data');

@Injectable()
export class EmailsService {
  private mailgunClient: Client;
  private domain: string;
  private emailVerificationEndpoint: string;
  private emailVerificationFrom: string;
  private emailVerificationSubject: string;
  constructor(private config: ConfigService<AppConfig>) {
    this.domain = this.config.get('mailgun.domain', {
      infer: true,
    });
    const username = this.config.get('mailgun.username', {
      infer: true,
    });
    const apiKey = this.config.get('mailgun.apiKey', {
      infer: true,
    });

    const frontendBaseUrl = this.config.get('frontend.baseUrl', {
      infer: true,
    });

    this.emailVerificationEndpoint = `${frontendBaseUrl}/alerts/verify-email`;

    this.emailVerificationFrom = this.config.get(
      'email.emailVerificationFrom',
      {
        infer: true,
      },
    );
    this.emailVerificationSubject = this.config.get(
      'email.emailVerificationSubject',
      {
        infer: true,
      },
    );

    const mailgun = new Mailgun(formData);
    this.mailgunClient = mailgun.client({
      username: username,
      key: apiKey,
    });
  }

  private async sendMessage(
    from: string,
    recipients: string[],
    subject: string,
    html: string,
  ) {
    try {
      await this.mailgunClient.messages.create(this.domain, {
        from,
        to: recipients,
        subject,
        html,
      });
    } catch (e) {
      throw new VError('Error while sending an email', e);
    }
  }

  async sendEmailVerificationMessage(recipient: string, token: string) {
    const link = this.emailVerificationEndpoint + '?token=' + token;
    const html =
      'Hello, <br><br> You are receiving this message because ' +
      'you recently created an alert destination in the Pagoda Developer Console. <br><br>' +
      '<a href="' +
      link +
      '">Follow this link to verify your email address.</a>' +
      '<br><br>' +
      'If you did not ask to verify this address, you can ignore this email. <br><br>' +
      'Thanks,<br>Your Pagoda Developer Console Team';

    await this.sendMessage(
      this.emailVerificationFrom,
      [recipient],
      this.emailVerificationSubject,
      html,
    );
  }
}
