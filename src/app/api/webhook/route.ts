// POST /api/webhook — Resend delivery webhook handler
// Receives delivery status events from Resend

import { NextRequest, NextResponse } from 'next/server';

// In-memory delivery status tracking
// This is intentionally ephemeral — no permanent storage
const deliveryStatuses = new Map<string, {
  status: 'sent' | 'delivered' | 'bounced' | 'failed' | 'delayed';
  timestamp: number;
}>();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { type, data } = body;

    if (!type || !data?.email_id) {
      return NextResponse.json({ received: true }, { status: 200 });
    }

    const emailId = data.email_id;

    switch (type) {
      case 'email.sent':
        deliveryStatuses.set(emailId, { status: 'sent', timestamp: Date.now() });
        break;
      case 'email.delivered':
        deliveryStatuses.set(emailId, { status: 'delivered', timestamp: Date.now() });
        break;
      case 'email.bounced':
        deliveryStatuses.set(emailId, { status: 'bounced', timestamp: Date.now() });
        break;
      case 'email.delivery_delayed':
        deliveryStatuses.set(emailId, { status: 'delayed', timestamp: Date.now() });
        break;
      case 'email.complained':
        deliveryStatuses.set(emailId, { status: 'failed', timestamp: Date.now() });
        break;
      default:
        break;
    }

    // Clean up old entries (older than 1 hour) to prevent memory leaks
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    for (const [key, value] of deliveryStatuses.entries()) {
      if (value.timestamp < oneHourAgo) {
        deliveryStatuses.delete(key);
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch {
    return NextResponse.json({ received: true }, { status: 200 });
  }
}

/**
 * GET /api/webhook?ids=id1,id2,id3
 * Query delivery statuses for given email IDs.
 * Does not expose any recipient information.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const idsParam = searchParams.get('ids');

  if (!idsParam) {
    return NextResponse.json({ statuses: {} });
  }

  const ids = idsParam.split(',').slice(0, 500); // Limit query size
  const statuses: Record<string, string> = {};

  for (const id of ids) {
    const status = deliveryStatuses.get(id.trim());
    if (status) {
      statuses[id.trim()] = status.status;
    }
  }

  return NextResponse.json({ statuses });
}
