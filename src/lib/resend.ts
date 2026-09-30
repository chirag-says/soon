// Resend email service integration
// All Resend API calls happen server-side only

import { Resend } from 'resend';

let resendClient: Resend | null = null;

/**
 * Gets the Resend client instance (server-side only).
 * Never expose this to the browser.
 */
export function getResendClient(): Resend {
  if (!resendClient) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error('RESEND_API_KEY environment variable is not configured.');
    }
    resendClient = new Resend(apiKey);
  }
  return resendClient;
}

/**
 * Gets the configured sender email and name.
 */
export function getSenderInfo(): { from: string } {
  const email = process.env.RESEND_FROM_EMAIL;
  const name = process.env.RESEND_FROM_NAME || 'SXCCAA West Zone';

  if (!email) {
    throw new Error('RESEND_FROM_EMAIL environment variable is not configured.');
  }

  return { from: `${name} <${email}>` };
}

export interface SendResult {
  success: boolean;
  id?: string;
  error?: string;
}

/**
 * Sends a single email via Resend.
 * Each recipient gets their own individual email for privacy.
 */
export async function sendSingleEmail(params: {
  to: string;
  subject: string;
  html: string;
}): Promise<SendResult> {
  try {
    const resend = getResendClient();
    const { from } = getSenderInfo();

    const { data, error } = await resend.emails.send({
      from,
      to: [params.to],
      subject: params.subject,
      html: params.html,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, id: data?.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return { success: false, error: message };
  }
}

/**
 * Sends emails in batches with rate limiting.
 * Returns results for each email without exposing recipient addresses.
 */
export async function sendBatchEmails(
  emails: { to: string; subject: string; html: string }[],
  batchSize: number = 10,
  delayMs: number = 1000
): Promise<{ results: SendResult[]; rateLimited: boolean }> {
  const results: SendResult[] = [];
  let rateLimited = false;

  for (let i = 0; i < emails.length; i += batchSize) {
    const batch = emails.slice(i, i + batchSize);

    const batchResults = await Promise.all(
      batch.map(async (email) => {
        try {
          return await sendSingleEmail(email);
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Unknown error';
          // Detect rate limiting
          if (message.toLowerCase().includes('rate limit') || message.toLowerCase().includes('too many requests')) {
            rateLimited = true;
            return { success: false, error: 'Rate limited' } as SendResult;
          }
          return { success: false, error: message } as SendResult;
        }
      })
    );

    results.push(...batchResults);

    if (rateLimited) break;

    // Delay between batches to respect rate limits
    if (i + batchSize < emails.length) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }

  return { results, rateLimited };
}
