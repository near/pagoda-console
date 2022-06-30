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

    this.emailVerificationEndpoint = this.config.get(
      'email.emailVerificationEndpoint',
      {
        infer: true,
      },
    );

    const mailgun = new Mailgun(formData);
    this.mailgunClient = mailgun.client({
      username: username,
      key: process.env.MAILGUN_API_KEY || apiKey,
    });
  }

  async sendMessage(recipients: string[], subject: string, html: string) {
    try {
      await this.mailgunClient.messages.create(this.domain, {
        from: 'Pagoda Dev Console <mailgun@sandboxe20d40efa0d94fa1a3d9173aabfd9c2c.mailgun.org>',
        to: recipients,
        subject,
        html,
      });
    } catch (e) {
      throw new VError('Error while sending an email', e);
    }
  }

  async sendEmailVerificationMessage(recipient: string, token: string) {
    const subject = 'Dev Console Alerts';
    const link = this.emailVerificationEndpoint + '?token=' + token;
    const html =
      'Please click the link to verify your email: <a href="' +
      link +
      '">HERE</a>';

    await this.sendMessage([recipient], subject, html);
  }
}
