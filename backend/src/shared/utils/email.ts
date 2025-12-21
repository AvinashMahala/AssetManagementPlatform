export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface EmailProvider {
  sendEmail(options: EmailOptions): Promise<boolean>;
}

class NoOpEmailProvider implements EmailProvider {
  async sendEmail(options: EmailOptions): Promise<boolean> {
    console.warn('Email functionality has been disabled. Alternative password reset methods are now used.');
    console.log('Email would have been sent to:', options.to, 'with subject:', options.subject);
    // Always return false to indicate email was not sent
    return false;
  }
}

class EmailService {
  private provider: EmailProvider;

  constructor() {
    console.log('Email service initialized with no-op provider (email functionality disabled)');
    this.provider = new NoOpEmailProvider();
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    return await this.provider.sendEmail(options);
  }

  async sendPasswordResetEmail(email: string, resetToken: string): Promise<boolean> {
    console.warn('Password reset email functionality has been replaced with alternative methods (security questions, recovery codes, admin reset)');
    return await this.sendEmail({
      to: email,
      subject: 'Password Reset Request - Asset Management Platform',
      html: '<p>Password reset functionality is now handled through alternative methods.</p>',
      text: 'Password reset functionality is now handled through alternative methods.',
    });
  }

  async sendEmailVerificationEmail(email: string, verificationToken: string): Promise<boolean> {
    console.warn('Email verification functionality is disabled. Consider implementing alternative verification methods.');
    return await this.sendEmail({
      to: email,
      subject: 'Email Verification - Asset Management Platform',
      html: '<p>Email verification functionality is currently disabled.</p>',
      text: 'Email verification functionality is currently disabled.',
    });
  }
}

export const emailService = (() => {
  let instance: EmailService | null = null;

  return {
    getInstance(): EmailService {
      if (!instance) {
        instance = new EmailService();
      }
      return instance;
    },

    // Delegate methods to the instance
    sendEmail(options: EmailOptions): Promise<boolean> {
      return this.getInstance().sendEmail(options);
    },

    sendPasswordResetEmail(email: string, resetToken: string): Promise<boolean> {
      return this.getInstance().sendPasswordResetEmail(email, resetToken);
    },

    sendEmailVerificationEmail(email: string, verificationToken: string): Promise<boolean> {
      return this.getInstance().sendEmailVerificationEmail(email, verificationToken);
    }
  };
})();