// Email HTML template generator
// Creates premium, email-client-compatible HTML emails

import type { Recipient } from './validation';

const FOOTER_HTML = `
<tr>
  <td style="padding: 0;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td style="padding: 32px 40px; border-top: 1px solid #c9a84c;">
          <p style="margin: 0 0 4px; font-family: 'Libre Baskerville', Georgia, 'Times New Roman', serif; font-size: 15px; line-height: 1.6; color: #1a2744;">
            Warm regards,
          </p>
          <p style="margin: 16px 0 0; font-family: 'Libre Baskerville', Georgia, 'Times New Roman', serif; font-size: 15px; line-height: 1.7; color: #1a2744;">
            <strong>Dr. Sanjay Goel</strong><br />
            Secretary, SXCCAA – West Zone Chapter<br />
            Contact: 9321154661
          </p>
          <p style="margin: 24px 0 0;">
            <a href="https://www.sxccaa.org/" style="display: inline-block; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; color: #c9a84c; text-decoration: none; border-bottom: 1px solid #c9a84c; padding-bottom: 2px;" target="_blank">
              Visit SXCCAA Website →
            </a>
          </p>
        </td>
      </tr>
    </table>
  </td>
</tr>
`;

/**
 * Generates a premium HTML email compatible with Gmail, Outlook, Apple Mail, and mobile clients.
 * Uses table-based layout and inline styles for maximum compatibility.
 */
export function generateEmailHTML(
  subject: string,
  bodyHtml: string,
  recipient: Recipient
): string {
  // Personalize {{name}} — fallback to "Xaverian" if name is empty
  const displayName = recipient.name.trim() || 'Xaverian';
  let personalizedBody = bodyHtml.replace(/\{\{name\}\}/gi, displayName);

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta name="x-apple-disable-message-reformatting" />
  <title>${escapeHtml(subject)}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:AllowPNG/>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style type="text/css">
    @import url('https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&display=swap');
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
    body { margin: 0 !important; padding: 0 !important; width: 100% !important; background-color: #f5f0e8; }
    @media only screen and (max-width: 620px) {
      .email-container { width: 100% !important; padding: 0 !important; }
      .content-cell { padding: 24px 20px !important; }
      .header-cell { padding: 24px 20px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f5f0e8; font-family: 'Libre Baskerville', Georgia, 'Times New Roman', serif;">
  <center style="width: 100%; background-color: #f5f0e8;">
    <!--[if mso | IE]>
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="600" align="center" style="width:600px;">
    <tr>
    <td>
    <![endif]-->
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto;" class="email-container">
      <!-- Header -->
      <tr>
        <td style="padding: 0;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td class="header-cell" style="background-color: #0f1d3a; padding: 32px 40px; text-align: center;">
                <p style="margin: 0; font-family: 'Libre Baskerville', Georgia, 'Times New Roman', serif; font-size: 13px; letter-spacing: 3px; color: #c9a84c; text-transform: uppercase;">
                  SXCCAA
                </p>
                <p style="margin: 6px 0 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 11px; letter-spacing: 1.5px; color: #a0aec0; text-transform: uppercase;">
                  St. Xavier's College (Calcutta) Alumni Association
                </p>
                <p style="margin: 2px 0 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 11px; letter-spacing: 1.5px; color: #a0aec0; text-transform: uppercase;">
                  West Zone Chapter
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <!-- Gold accent line -->
      <tr>
        <td style="background-color: #c9a84c; height: 3px; font-size: 1px; line-height: 1px;">&nbsp;</td>
      </tr>
      <!-- Body -->
      <tr>
        <td style="padding: 0;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td class="content-cell" style="background-color: #ffffff; padding: 40px 40px 32px; font-family: 'Libre Baskerville', Georgia, 'Times New Roman', serif; font-size: 15px; line-height: 1.8; color: #2d3748;">
                ${personalizedBody}
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <!-- Footer -->
      ${FOOTER_HTML}
      <!-- Bottom bar -->
      <tr>
        <td style="background-color: #0f1d3a; padding: 16px 40px; text-align: center;">
          <p style="margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 11px; color: #64748b; line-height: 1.5;">
            © ${new Date().getFullYear()} St. Xavier's College (Calcutta) Alumni Association – West Zone Chapter
          </p>
        </td>
      </tr>
    </table>
    <!--[if mso | IE]>
    </td>
    </tr>
    </table>
    <![endif]-->
  </center>
</body>
</html>`;
}

/**
 * Generates a plain-text version of the email for accessibility.
 */
export function generatePlainText(bodyText: string, recipient: Recipient): string {
  const displayName = recipient.name.trim() || 'Xaverian';
  let personalized = bodyText.replace(/\{\{name\}\}/gi, displayName);

  return `${personalized}

---

Warm regards,

Dr. Sanjay Goel
Secretary, SXCCAA – West Zone Chapter
Contact: 9321154661

Visit SXCCAA Website: https://www.sxccaa.org/

© ${new Date().getFullYear()} St. Xavier's College (Calcutta) Alumni Association – West Zone Chapter`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Default email subject for Nostalgia '26
 */
export const DEFAULT_SUBJECT = "Invitation | Nostalgia '26 – Annual Alumni Reunion | 3 October 2026";

/**
 * Default email body HTML for Nostalgia '26
 */
export const DEFAULT_BODY_HTML = `<p>Dear {{name}},</p>

<p>Warm greetings from the St. Xavier's College (Calcutta) Alumni Association – West Zone Chapter.</p>

<p>We are delighted to invite you to <strong>Nostalgia '26 – Annual Alumni Reunion</strong>, a special gathering of Xaverians to reconnect, reminisce and celebrate the enduring bonds of our alma mater.</p>

<p style="margin: 24px 0; padding: 20px 24px; background-color: #f8f6f0; border-left: 3px solid #c9a84c; font-family: Georgia, 'Times New Roman', serif;">
  <strong style="color: #0f1d3a;">Saturday, 3rd October 2026</strong><br />
  <span style="color: #4a5568;">Taj Santacruz, Mumbai</span>
</p>

<p>The day features an engaging programme of distinguished addresses, felicitation ceremonies, a fireside chat, Shakti Samman, gala lunch and fellowship.</p>

<p>We are also honoured to have <strong>Ms. Ananya Birla</strong>, Director at Aditya Birla Group and Founder & Chairperson, Svatantra Microfin, as our Special Invitee.</p>

<p>We look forward to welcoming you to an unforgettable reunion filled with memories, conversations and the spirit of Xavierism.</p>`;
