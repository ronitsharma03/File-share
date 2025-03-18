import nodemailer from "nodemailer";
import config from "../../config/config";

export interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: config.notification.emailService,
      port: 465,
      secure: true,
      auth: {
        user: config.notification.emailUser,
        pass: config.notification.emailPassword,
      },
    });
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      const mailOptions = {
        from: config.notification.emailUser,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`Email sent to ${options.to}`);
      return true;
    } catch (error) {
      console.error(`Error from email service: ${error}`);
      return false;
    }
  }

  async sendTransferNotification(
    recipientEmail: string,
    fileName: string,
    downloadUrl: string,
    expiresAt: Date
  ): Promise<boolean> {
    const subject = `File Transfer: ${fileName}`;
    const expiryDate = expiresAt.toLocaleString();

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>File Transfer Notification</h2>
        <p>A file has been shared with you:</p>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>File Name:</strong> ${fileName}</p>
          <p><strong>Available Until:</strong> ${expiryDate}</p>
        </div>
        <p>You can download the file using the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${downloadUrl}" 
             style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
            Download File
          </a>
        </div>
        <p style="color: #888; font-size: 12px;">
          Note: This link will expire on ${expiryDate}. Please download the file before then.
        </p>
      </div>
    `;

    return this.sendEmail({
      to: recipientEmail,
      subject,
      html,
    });
  }

  async sendExpirationReminder(
    recipientEmail: string,
    fileName: string,
    downloadUrl: string,
    expiresAt: Date
  ): Promise<boolean> {
    const subject = `Reminder: File "${fileName}" is about to expire`;
    const expiryDate = expiresAt.toLocaleString();

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>File Expiration Reminder</h2>
        <p>The file shared with you is about to expire:</p>
        <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; border: 1px solid #ffeeba;">
          <p><strong>File Name:</strong> ${fileName}</p>
          <p><strong>Expires On:</strong> ${expiryDate}</p>
        </div>
        <p>Please download the file before it expires using the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${downloadUrl}" 
             style="background-color: #ffc107; color: #212529; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
            Download Now
          </a>
        </div>
        <p style="color: #888; font-size: 12px;">
          Note: Once the file expires, it will no longer be available for download.
        </p>
      </div>
    `;

    return this.sendEmail({
      to: recipientEmail,
      subject,
      html,
    });
  }
}

export default new EmailService();