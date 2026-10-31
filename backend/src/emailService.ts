import nodemailer from 'nodemailer';

/**
 * Sends mail through Gmail using OAuth2 refresh-token credentials.
 * Returns false when mail is not configured or delivery fails; callers should
 * never roll back a successfully committed order because an email failed.
 */
export async function sendGmailMessage(to: string, subject: string, text: string): Promise<boolean> {
  const { GMAIL_USER, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GMAIL_REFRESH_TOKEN } = process.env;
  if (!GMAIL_USER || !GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GMAIL_REFRESH_TOKEN) {
    console.warn('[email] Gmail OAuth2 is not configured; skipping delivery.');
    return false;
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: GMAIL_USER,
        clientId: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        refreshToken: GMAIL_REFRESH_TOKEN,
      },
    });
    await transporter.sendMail({
      from: `DIGITAL STORE <${GMAIL_USER}>`,
      to,
      subject,
      text,
    });
    console.info(`[email] Message sent to ${to}: ${subject}`);
    return true;
  } catch (error: any) {
    console.error('[email] Gmail delivery failed:', error?.message || error);
    return false;
  }
}
