export interface IEmailService {
  sendVerificationEmail(to: string, token: string): Promise<void>;
  sendPasswordResetEmail(to: string, token: string): Promise<void>;
}

export class MockEmailAdapter implements IEmailService {
  async sendVerificationEmail(to: string, token: string): Promise<void> {
    console.log(`
      ---------------------------------------------------------
      [MOCK EMAIL SERVICE] -> sendVerificationEmail
      To: ${to}
      Verification Token: ${token}
      Action URL: http://localhost:3000/verify-email?token=${token}
      ---------------------------------------------------------
    `);
  }

  async sendPasswordResetEmail(to: string, token: string): Promise<void> {
    console.log(`
      ---------------------------------------------------------
      [MOCK EMAIL SERVICE] -> sendPasswordResetEmail
      To: ${to}
      Reset Token: ${token}
      Action URL: http://localhost:3000/reset-password?token=${token}
      ---------------------------------------------------------
    `);
  }
}

export const emailService = new MockEmailAdapter();
