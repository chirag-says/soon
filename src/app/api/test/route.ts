// POST /api/test — Send a single test email
// Server-side only.

import { NextRequest, NextResponse } from 'next/server';
import { isValidEmail, sanitizeEmailContent } from '@/lib/validation';
import { generateEmailHTML } from '@/lib/email';
import { sendSingleEmail, getSenderInfo } from '@/lib/resend';

interface TestRequestBody {
  testEmail: string;
  subject: string;
  bodyHtml: string;
  testName?: string;
}

export async function POST(request: NextRequest) {
  try {
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        { error: 'Email service is not configured. Please set RESEND_API_KEY.' },
        { status: 500 }
      );
    }

    try {
      getSenderInfo();
    } catch {
      return NextResponse.json(
        { error: 'Sender email is not configured. Please set RESEND_FROM_EMAIL.' },
        { status: 500 }
      );
    }

    const body: TestRequestBody = await request.json();

    if (!body.testEmail || !isValidEmail(body.testEmail)) {
      return NextResponse.json({ error: 'Please provide a valid test email address.' }, { status: 400 });
    }

    if (!body.subject || body.subject.trim().length === 0) {
      return NextResponse.json({ error: 'Email subject is required.' }, { status: 400 });
    }

    if (!body.bodyHtml || body.bodyHtml.trim().length === 0) {
      return NextResponse.json({ error: 'Email body is required.' }, { status: 400 });
    }

    const sanitizedBody = sanitizeEmailContent(body.bodyHtml);
    const subject = `[TEST] ${body.subject.trim().slice(0, 200)}`;

    const html = generateEmailHTML(subject, sanitizedBody, {
      name: body.testName || 'Test Recipient',
      email: body.testEmail,
    });

    const result = await sendSingleEmail({
      to: body.testEmail,
      subject,
      html,
    });

    if (result.success) {
      return NextResponse.json({ success: true, message: 'Test email sent successfully.' });
    } else {
      return NextResponse.json(
        { error: result.error || 'Failed to send test email.' },
        { status: 500 }
      );
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
