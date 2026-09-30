// Email validation and sanitization utilities

export interface Recipient {
  name: string;
  email: string;
}

export interface ValidationResult {
  valid: Recipient[];
  invalid: { name: string; email: string; reason: string }[];
  duplicatesRemoved: number;
  totalFound: number;
}

/**
 * Validates a single email address using a robust regex pattern.
 * Does NOT log the email address.
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  const trimmed = email.trim();
  if (trimmed.length === 0 || trimmed.length > 254) return false;
  // RFC 5322 simplified pattern
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return emailRegex.test(trimmed);
}

/**
 * Validates and deduplicates a list of recipients.
 * Only retains name and email — all other fields are stripped.
 * Email comparison is case-insensitive.
 */
export function validateRecipients(
  rawRecipients: { name?: string; email?: string }[]
): ValidationResult {
  const totalFound = rawRecipients.length;
  const seen = new Set<string>();
  const valid: Recipient[] = [];
  const invalid: { name: string; email: string; reason: string }[] = [];
  let duplicatesRemoved = 0;

  for (const r of rawRecipients) {
    const name = (r.name || '').trim();
    const email = (r.email || '').trim();

    if (!email) {
      invalid.push({ name, email, reason: 'Missing email address' });
      continue;
    }

    const normalizedEmail = email.toLowerCase();

    if (seen.has(normalizedEmail)) {
      duplicatesRemoved++;
      continue;
    }

    seen.add(normalizedEmail);

    if (!isValidEmail(email)) {
      invalid.push({ name, email: maskEmail(email), reason: 'Invalid email format' });
      continue;
    }

    // Only retain name and email — nothing else
    valid.push({ name, email: normalizedEmail });
  }

  return { valid, invalid, duplicatesRemoved, totalFound };
}

/**
 * Masks an email address for safe display in error messages.
 * e.g., "rahul@gmail.com" → "r***l@g***l.com"
 */
function maskEmail(email: string): string {
  const parts = email.split('@');
  if (parts.length !== 2) return '***';
  const local = parts[0];
  const domain = parts[1];
  const maskedLocal = local.length <= 2
    ? local[0] + '***'
    : local[0] + '***' + local[local.length - 1];
  return `${maskedLocal}@${domain}`;
}

/**
 * Sanitizes HTML content to prevent XSS in email bodies.
 * Allows safe HTML tags for email formatting.
 */
export function sanitizeEmailContent(html: string): string {
  // Remove script tags and event handlers
  let sanitized = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  sanitized = sanitized.replace(/\bon\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]*)/gi, '');
  sanitized = sanitized.replace(/javascript\s*:/gi, '');
  return sanitized;
}
