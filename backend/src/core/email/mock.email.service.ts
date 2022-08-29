import { Injectable } from '@nestjs/common';

@Injectable()
export class MockEmailService {
  async sendMessage(
    from: string,
    recipients: string[],
    subject: string,
    html: string,
  ) {
    console.log('*** Mocked email output ***');
    console.log('From:', from);
    console.log('Recipients:', recipients);
    console.log('Subject:', subject);
    console.log('Body:', html);
  }
}
