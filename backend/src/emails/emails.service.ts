import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Mailgun from 'mailgun.js';
import Client from 'mailgun.js/client';
import { AppConfig } from 'src/config/validate';
import { VError } from 'verror';
import * as formData from 'form-data';

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
      'Please click the link to verify your email: <a href="' +
      link +
      '">HERE</a>';

    await this.sendMessage(
      this.emailVerificationFrom,
      [recipient],
      this.emailVerificationSubject,
      html,
    );
  }
}
