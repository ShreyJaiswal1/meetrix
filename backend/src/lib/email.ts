import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY
    ? new Resend(process.env.RESEND_API_KEY)
    : null;

const FROM = process.env.RESEND_FROM || 'Meetrix <onboarding@resend.dev>';

// ─── Generate 6-digit OTP ───
export function generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// ─── Send Verification Email ───
export async function sendVerificationEmail(email: string, code: string): Promise<void> {
    const html = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 24px;">
            <h2 style="color: #1a1a2e; margin-bottom: 8px;">Verify your email</h2>
            <p style="color: #666; font-size: 15px; line-height: 1.6;">
                Welcome to Meetrix! Enter the code below to verify your email address.
            </p>
            <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0;">
                <span style="font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #fff;">${code}</span>
            </div>
            <p style="color: #999; font-size: 13px;">This code expires in 10 minutes. If you didn't create an account, you can ignore this email.</p>
        </div>
    `;

    if (resend) {
        await resend.emails.send({ from: FROM, to: email, subject: 'Verify your Meetrix account', html });
    } else {
        console.log(`\n📧 [DEV] Verification email for ${email}\n   Code: ${code}\n`);
    }
}

// ─── Send Password Reset Email ───
export async function sendPasswordResetEmail(email: string, code: string): Promise<void> {
    const html = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 24px;">
            <h2 style="color: #1a1a2e; margin-bottom: 8px;">Reset your password</h2>
            <p style="color: #666; font-size: 15px; line-height: 1.6;">
                Use the code below to reset your Meetrix password.
            </p>
            <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0;">
                <span style="font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #fff;">${code}</span>
            </div>
            <p style="color: #999; font-size: 13px;">This code expires in 10 minutes. If you didn't request a password reset, you can ignore this email.</p>
        </div>
    `;

    if (resend) {
        await resend.emails.send({ from: FROM, to: email, subject: 'Reset your Meetrix password', html });
    } else {
        console.log(`\n📧 [DEV] Password reset email for ${email}\n   Code: ${code}\n`);
    }
}
