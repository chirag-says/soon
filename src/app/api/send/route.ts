// POST /api/send — Send emails to all recipients
// Server-side only. Never exposes API keys or full recipient lists.

import { NextRequest, NextResponse } from 'next/server';
import { isValidEmail, sanitizeEmailContent } from '@/lib/validation';
import { generateEmailHTML } from '@/lib/email';
import { sendSingleEmail, getSenderInfo } from '@/lib/resend';

interface SendRequestBody {
  recipients: { name: string; email: string }[];
  subject: string;
  bodyHtml: string;
}

// Track active campaigns to prevent duplicate sends
let activeCampaignId: string | null = null;

export async function POST(request: NextRequest) {
  try {
    // Check for Resend configuration
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        { error: 'Email service is not configured. Please set RESEND_API_KEY.' },
        { status: 500 }
      );
    }

    // Verify sender is configured
    try {
      getSenderInfo();
    } catch {
      return NextResponse.json(
        { error: 'Sender email is not configured. Please set RESEND_FROM_EMAIL.' },
        { status: 500 }
      );
    }

    const body: SendRequestBody = await request.json();

    // Validate request
    if (!body.recipients || !Array.isArray(body.recipients) || body.recipients.length === 0) {
      return NextResponse.json({ error: 'No recipients provided.' }, { status: 400 });
    }

    if (!body.subject || typeof body.subject !== 'string' || body.subject.trim().length === 0) {
      return NextResponse.json({ error: 'Email subject is required.' }, { status: 400 });
    }

    if (!body.bodyHtml || typeof body.bodyHtml !== 'string' || body.bodyHtml.trim().length === 0) {
      return NextResponse.json({ error: 'Email body is required.' }, { status: 400 });
    }

    if (body.recipients.length > 2000) {
      return NextResponse.json(
        { error: 'Maximum 2000 recipients per campaign.' },
        { status: 400 }
      );
    }

    // Generate campaign ID for idempotency
    const campaignId = `campaign-${Date.now()}`;

    // Prevent duplicate campaigns
    if (activeCampaignId) {
      return NextResponse.json(
        { error: 'A campaign is already being sent. Please wait for it to complete.' },
        { status: 409 }
      );
    }

    activeCampaignId = campaignId;

    // Sanitize email content
    const sanitizedBody = sanitizeEmailContent(body.bodyHtml);
    const subject = body.subject.trim().slice(0, 200);

    // Validate and filter recipients server-side
    const validRecipients = body.recipients.filter(
      (r) => r.email && isValidEmail(r.email)
    );

    if (validRecipients.length === 0) {
      activeCampaignId = null;
      return NextResponse.json({ error: 'No valid recipients found.' }, { status: 400 });
    }

    // Send emails individually for privacy — NO CC/BCC
    const results: { index: number; success: boolean; id?: string; error?: string }[] = [];
    let rateLimited = false;

    const BATCH_SIZE = 5;
    const DELAY_MS = 500;

    for (let i = 0; i < validRecipients.length; i += BATCH_SIZE) {
      if (rateLimited) break;

      const batch = validRecipients.slice(i, i + BATCH_SIZE);

      const batchResults = await Promise.all(
        batch.map(async (recipient, batchIndex) => {
          const globalIndex = i + batchIndex;
          try {
            // Generate personalized HTML for each recipient
            const html = generateEmailHTML(subject, sanitizedBody, {
              name: recipient.name || '',
              email: recipient.email,
            });

            const result = await sendSingleEmail({
              to: recipient.email,
              subject,
              html,
            });

            if (result.error?.toLowerCase().includes('rate limit') ||
                result.error?.toLowerCase().includes('too many requests')) {
              rateLimited = true;
            }

            return {
              index: globalIndex,
              success: result.success,
              id: result.id,
              error: result.error,
            };
          } catch {
            return {
              index: globalIndex,
              success: false,
              error: 'Sending failed',
            };
          }
        })
      );

      results.push(...batchResults);

      // Rate limiting delay between batches
      if (i + BATCH_SIZE < validRecipients.length && !rateLimited) {
        await new Promise((resolve) => setTimeout(resolve, DELAY_MS));
      }
    }

    activeCampaignId = null;

    // Return safe summary — no email addresses in response
    const sent = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;

    return NextResponse.json({
      campaignId,
      total: validRecipients.length,
      sent,
      failed,
      rateLimited,
      // Return per-recipient status by index only — no email addresses
      statuses: results.map((r) => ({
        index: r.index,
        success: r.success,
        id: r.id,
        error: r.success ? undefined : (r.error || 'Unknown error'),
      })),
    });
  } catch (err) {
    activeCampaignId = null;
    const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
