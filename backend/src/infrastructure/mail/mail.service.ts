import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  async send(options: { to: string; subject: string; text: string }): Promise<void> {
    // stub
  }
}
