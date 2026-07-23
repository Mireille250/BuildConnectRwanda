import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private readonly config: ConfigService) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.config.get<string>('EMAIL_USER'),
        pass: this.config.get<string>('EMAIL_PASS'),
      },
    });
  }

  async sendPasswordReset(to: string, firstName: string, resetUrl: string) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Inter, Arial, sans-serif; background: #f8fafc; margin: 0; padding: 0; }
          .container { max-width: 520px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
          .header { background: #1E3A8A; padding: 32px; text-align: center; }
          .header h1 { color: white; margin: 0; font-size: 24px; font-weight: 700; }
          .header p { color: #93c5fd; margin: 4px 0 0; font-size: 14px; }
          .body { padding: 32px; }
          .body h2 { color: #1e293b; font-size: 20px; margin: 0 0 8px; }
          .body p { color: #64748b; line-height: 1.6; font-size: 15px; }
          .btn { display: block; width: fit-content; margin: 24px auto; background: #1E3A8A; color: white; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-weight: 600; font-size: 15px; }
          .note { background: #f8fafc; border-radius: 8px; padding: 16px; margin-top: 24px; }
          .note p { color: #94a3b8; font-size: 13px; margin: 0; }
          .footer { text-align: center; padding: 20px; color: #94a3b8; font-size: 12px; border-top: 1px solid #f1f5f9; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🏗️ BuildConnect Rwanda</h1>
            <p>Rwanda's #1 Construction Platform</p>
          </div>
          <div class="body">
            <h2>Reset your password</h2>
            <p>Hi ${firstName},</p>
            <p>We received a request to reset your password. Click the button below to create a new password. This link expires in <strong>1 hour</strong>.</p>
            <a href="${resetUrl}" class="btn">Reset My Password</a>
            <div class="note">
              <p>⚠️ If you didn't request a password reset, you can safely ignore this email. Your password will not change.</p>
            </div>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} BuildConnect Rwanda · Kigali, Rwanda</p>
            <p>hello@buildconnect.rw</p>
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      await this.transporter.sendMail({
        from: `"BuildConnect Rwanda" <${this.config.get('EMAIL_USER')}>`,
        to,
        subject: 'Reset your BuildConnect password',
        html,
      });
      this.logger.log(`Password reset email sent to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}`, error);
      throw error;
    }
  }

  async sendWelcomeEmail(to: string, firstName: string) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Inter, Arial, sans-serif; background: #f8fafc; margin: 0; padding: 0; }
          .container { max-width: 520px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
          .header { background: #1E3A8A; padding: 32px; text-align: center; }
          .header h1 { color: white; margin: 0; font-size: 24px; font-weight: 700; }
          .body { padding: 32px; }
          .body h2 { color: #1e293b; font-size: 20px; margin: 0 0 8px; }
          .body p { color: #64748b; line-height: 1.6; font-size: 15px; }
          .btn { display: block; width: fit-content; margin: 24px auto; background: #F59E0B; color: white; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-weight: 600; font-size: 15px; }
          .footer { text-align: center; padding: 20px; color: #94a3b8; font-size: 12px; border-top: 1px solid #f1f5f9; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🏗️ BuildConnect Rwanda</h1>
          </div>
          <div class="body">
            <h2>Welcome, ${firstName}! 🎉</h2>
            <p>Your account has been created successfully. You can now connect with verified professionals, post jobs, and grow your construction career across Rwanda.</p>
            <a href="${this.config.get('FRONTEND_URL')}/dashboard" class="btn">Go to Dashboard →</a>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} BuildConnect Rwanda</p>
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      await this.transporter.sendMail({
        from: `"BuildConnect Rwanda" <${this.config.get('EMAIL_USER')}>`,
        to,
        subject: 'Welcome to BuildConnect Rwanda! 🏗️',
        html,
      });
    } catch (error) {
      this.logger.warn(`Failed to send welcome email to ${to}`);
    }
  }
}