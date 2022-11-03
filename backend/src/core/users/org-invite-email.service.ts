import { AppConfig } from '@/src/config/validate';
import { EmailService } from '@/src/core/email/email.service';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class OrgInviteEmailService {
  private endpoint: string;
  private from: string;

  constructor(
    private config: ConfigService<AppConfig>,
    private email: EmailService,
  ) {
    const frontendBaseUrl = this.config.get('frontend.baseUrl', {
      infer: true,
    });

    this.endpoint = `${frontendBaseUrl}/organizations/accept-invite`;

    this.from = this.config.get('email.noReply', {
      infer: true,
    })!;
  }

  async sendInvite(orgName: string, recipient: string, token: string) {
    const link = `${this.endpoint}?token=${token}`;
    // TODO notify user when invitation will expire. Maybe we should change token expiration to days instead of minutes? Days seems more common.
    const html =
      'Hello, <br><br> You are receiving this message because ' +
      `you have been invited to join the <b>${orgName}</b> organization in Pagoda. <br><br>` +
      '<a href="' +
      link +
      `">Follow this link to join the <b>${orgName}</b> organization.</a>` +
      '<br><br>' +
      'If you were not expecting this invitation, you can ignore this email. <br><br>' +
      'Thanks,<br>Your Pagoda Team';

    await this.email.sendMessage(
      this.from,
      [recipient],
      `You've been invited to join the ${orgName} organization`,
      html,
    );
  }
}
