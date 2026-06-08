import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  async sendMail(options: { to: string; subject: string; html: string }): Promise<void> {
    // Stub — replace with real mail provider (SendGrid, SES, etc.)
    console.log(`[MAIL] To: ${options.to}, Subject: ${options.subject}`);
  }

  async sendPasswordReset(email: string, token: string): Promise<void> {
    await this.sendMail({
      to: email,
      subject: 'Password Reset — NestFind',
      html: `Your password reset token: ${token}`,
    });
  }
}
