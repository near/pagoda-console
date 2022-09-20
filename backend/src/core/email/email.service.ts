import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Mailgun from 'mailgun.js';
import Client from 'mailgun.js/client';
import { AppConfig } from 'src/config/validate';
import { VError } from 'verror';
import * as formData from 'form-data';

@Injectable()
export class EmailService {
  private mailgunClient: Client;
  private domain: string;
  constructor(private config: ConfigService<AppConfig>) {
    this.domain = this.config.get('mailgun.domain', {
      infer: true,
    });
    const apiKey = this.config.get('mailgun.apiKey', {
      infer: true,
    });

    const mailgun = new Mailgun(formData);
    this.mailgunClient = mailgun.client({
      username: 'unused-value',
      key: apiKey,
    });
  }

  async sendMessage(
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
      throw new VError(e, 'Error while sending an email');
    }
  }
}
