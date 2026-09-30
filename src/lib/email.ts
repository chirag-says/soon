// Email HTML template generator
// Creates premium, email-client-compatible HTML invitation emails
// Structure: Event Banner → Editable Body → Programme Schedule → Special Invitee → Footer

import type { Recipient } from './validation';

/**
 * Fixed programme schedule — auto-appended to every email.
 */
const PROGRAMME_HTML = `
<tr>
  <td style="padding: 0;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      <!-- Programme Header -->
      <tr>
        <td style="background-color: #0f1d3a; padding: 24px 40px; text-align: center;">
          <p style="margin: 0; font-family: 'Libre Baskerville', Georgia, serif; font-size: 11px; letter-spacing: 3px; color: #c9a84c; text-transform: uppercase; font-weight: 700;">
            Programme Schedule
          </p>
        </td>
      </tr>
      <!-- Schedule Table -->
      <tr>
        <td style="padding: 0;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse;">
            ${programmeRow('9:15 AM', 'Registration & Meet and Greet', 'Tea, Coffee and Vadapav awaits', false)}
            ${programmeRow('10:30 AM', 'Lighting of the Lamp', 'Followed by the National Anthem', true)}
            ${programmeRow('10:40 AM', 'Address by Rev. Dr. Dominic Savio, SJ', 'Principal SXC, President SXCCAA', false)}
            ${programmeRow('10:45 AM', 'Welcome Message by Mr. Firdusal Hasan', 'Ex Secretary SXCCAA', true)}
            ${programmeRow('10:55 AM', 'Welcome Message by Dr. Sanjay Goel', 'Secretary SXCCAA (West Zone Chapter)', false)}
            ${programmeRow('11:05 AM', 'Special Address by Chief Guest Mr. Amit Haralka', 'CEO, ArcelorMittal Nippon Steel India', true)}
            ${programmeRow('11:15 AM', 'Felicitation of Ms. Aswati Dorje, IPS', 'ADGP, Prevention of Crime Against Women & Children', false)}
            ${programmeRow('11:35 AM', 'Keynote Address by Xaverian Mr. Robin Banerjee', 'Chairman, Nucleon Research Pvt Ltd', true)}
            ${programmeRow('12:05 PM', 'Fireside Chat with Mr. Pankaj Tibrewal', 'Founder & CIO, IKIGAI Asset Manager · Ex-Kotak MF — with Mr. Saurav Gupta, Deputy Editor, NDTV', false)}
            ${programmeRow('12:45 PM', 'Keynote Address & Felicitation of Ms. Priti Rathi Gupta', 'Founder, Lxme · Ex Managing Director @ Anand Rathi', true)}
            ${programmeRow('1:15 PM', 'Gala Lunch and Fellowship', '', false)}
            ${programmeRow('2:15 PM', 'SHAKTI SAMMAN', 'Felicitation of Awardees & Brief Address by them', true)}
            ${programmeRow('4:15 PM', 'Vote of Thanks by CA. Parimal Sheth', '', false)}
            ${programmeRow('4:25 PM', 'Sumptuous High Tea and Fellowship', '', true)}
          </table>
        </td>
      </tr>
    </table>
  </td>
</tr>
`;

function programmeRow(time: string, title: string, subtitle: string, alt: boolean): string {
  const bg = alt ? '#f8f6f1' : '#ffffff';
  return `
    <tr>
      <td style="background-color: ${bg}; padding: 14px 20px 14px 40px; width: 90px; vertical-align: top; border-bottom: 1px solid #eee8d5;">
        <p style="margin: 0; font-family: 'Libre Baskerville', Georgia, serif; font-size: 12px; color: #c9a84c; font-weight: 700; white-space: nowrap;">${time}</p>
      </td>
      <td style="background-color: ${bg}; padding: 14px 40px 14px 16px; vertical-align: top; border-bottom: 1px solid #eee8d5;">
        <p style="margin: 0; font-family: 'Libre Baskerville', Georgia, serif; font-size: 13px; color: #0f1d3a; font-weight: 700; line-height: 1.5;">${title}</p>
        ${subtitle ? `<p style="margin: 3px 0 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 12px; color: #6b7280; line-height: 1.5;">${subtitle}</p>` : ''}
      </td>
    </tr>`;
}

/**
 * Special invitee section — auto-appended.
 */
const SPECIAL_INVITEE_HTML = `
<tr>
  <td style="padding: 0;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td style="background-color: #0f1d3a; padding: 28px 40px; text-align: center;">
          <p style="margin: 0 0 4px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 10px; letter-spacing: 2.5px; color: #c9a84c; text-transform: uppercase;">
            Special Invitee
          </p>
          <p style="margin: 10px 0 0; font-family: 'Libre Baskerville', Georgia, serif; font-size: 18px; color: #ffffff; font-weight: 700;">
            Ms. Ananya Birla
          </p>
          <p style="margin: 6px 0 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 12px; color: #a0aec0; line-height: 1.6;">
            Director at Aditya Birla Group<br />
            Founder &amp; Chairperson, Svatantra Microfin
          </p>
        </td>
      </tr>
    </table>
  </td>
</tr>
`;

/**
 * Fixed closing + footer — auto-appended.
 */
const FOOTER_HTML = `
<tr>
  <td style="padding: 0;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td style="background-color: #ffffff; padding: 32px 40px;">
          <p style="margin: 0; font-family: 'Libre Baskerville', Georgia, serif; font-size: 14px; line-height: 1.8; color: #2d3748;">
            We look forward to welcoming you to <strong style="color: #0f1d3a;">Nostalgia '26</strong> and sharing a memorable day of friendship, fellowship and the spirit of Xavierism.
          </p>
        </td>
      </tr>
      <tr>
        <td style="padding: 0 40px 36px; background-color: #ffffff;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="border-top: 1px solid #c9a84c; padding-top: 24px;">
                <p style="margin: 0 0 2px; font-family: 'Libre Baskerville', Georgia, serif; font-size: 14px; color: #4a5568; font-style: italic;">
                  Warm regards,
                </p>
                <p style="margin: 16px 0 0; font-family: 'Libre Baskerville', Georgia, serif; font-size: 14px; line-height: 1.7; color: #0f1d3a;">
                  <strong>Dr. Sanjay Goel</strong><br />
                  <span style="color: #4a5568;">Secretary, SXCCAA – West Zone Chapter</span><br />
                  <strong style="color: #4a5568;">Contact: 9321154661</strong>
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </td>
</tr>
`;

/**
 * SXCCAA website link bar.
 */
const WEBSITE_BAR_HTML = `
<tr>
  <td style="background-color: #f5f0e8; padding: 20px 40px; text-align: center; border-top: 1px solid #e0d5c0;">
    <a href="https://www.sxccaa.org/" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13px; color: #c9a84c; text-decoration: none; font-weight: 600; letter-spacing: 0.5px;" target="_blank">
      Visit SXCCAA Website &rarr;
    </a>
  </td>
</tr>
`;

/**
 * Generates a premium HTML invitation email.
 * Structure: Event Banner → Editable Body → Programme Schedule → Special Invitee → Closing + Footer
 */
export function generateEmailHTML(
  subject: string,
  bodyHtml: string,
  recipient: Recipient
): string {
  // Personalize {{name}} — fallback to "Xaverian" if name is empty
  const displayName = recipient.name.trim() || 'Xaverian';
  const personalizedBody = bodyHtml.replace(/\{\{name\}\}/gi, displayName);

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
      .header-cell { padding: 32px 20px !important; }
      .prog-time { padding-left: 20px !important; }
      .prog-desc { padding-right: 20px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f5f0e8; font-family: 'Libre Baskerville', Georgia, serif;">
  <center style="width: 100%; background-color: #f5f0e8;">
    <!--[if mso | IE]>
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="600" align="center" style="width:600px;">
    <tr>
    <td>
    <![endif]-->
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto;" class="email-container">

      <!-- ============ EVENT BANNER ============ -->
      <tr>
        <td style="padding: 0;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td class="header-cell" style="background-color: #0f1d3a; padding: 44px 40px 20px; text-align: center;">
                <!-- SXCCAA Badge -->
                <p style="margin: 0; font-family: 'Libre Baskerville', Georgia, serif; font-size: 12px; letter-spacing: 4px; color: #c9a84c; text-transform: uppercase; font-weight: 700;">
                  SXCCAA
                </p>
                <p style="margin: 5px 0 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 10px; letter-spacing: 2px; color: #7a8ba8; text-transform: uppercase;">
                  West Zone Chapter
                </p>
              </td>
            </tr>
            <!-- Gold divider -->
            <tr>
              <td style="background-color: #0f1d3a; padding: 0 60px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td style="border-bottom: 1px solid #c9a84c33; font-size: 1px; line-height: 1px;">&nbsp;</td>
                  </tr>
                </table>
              </td>
            </tr>
            <!-- Event Title -->
            <tr>
              <td style="background-color: #0f1d3a; padding: 24px 40px 12px; text-align: center;">
                <p style="margin: 0; font-family: 'Libre Baskerville', Georgia, serif; font-size: 28px; color: #ffffff; font-weight: 700; line-height: 1.3; letter-spacing: -0.5px;">
                  Nostalgia '26
                </p>
                <p style="margin: 8px 0 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 11px; letter-spacing: 3px; color: #c9a84c; text-transform: uppercase;">
                  Annual Alumni Reunion
                </p>
              </td>
            </tr>
            <!-- Date & Venue -->
            <tr>
              <td style="background-color: #0f1d3a; padding: 20px 40px 40px; text-align: center;">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin: 0 auto;">
                  <tr>
                    <td style="padding: 12px 24px; border: 1px solid #c9a84c44; border-radius: 6px;">
                      <p style="margin: 0; font-family: 'Libre Baskerville', Georgia, serif; font-size: 14px; color: #ffffff; font-weight: 700; line-height: 1.6;">
                        Saturday, 3rd October 2026
                      </p>
                      <p style="margin: 4px 0 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 12px; color: #a0aec0; letter-spacing: 0.5px;">
                        Taj Santacruz, Mumbai
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- Gold accent line -->
      <tr>
        <td style="background-color: #c9a84c; height: 3px; font-size: 1px; line-height: 1px;">&nbsp;</td>
      </tr>

      <!-- ============ EDITABLE BODY ============ -->
      <tr>
        <td style="padding: 0;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td class="content-cell" style="background-color: #ffffff; padding: 36px 40px 28px; font-family: 'Libre Baskerville', Georgia, serif; font-size: 14px; line-height: 1.9; color: #2d3748;">
                ${personalizedBody}
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- ============ PROGRAMME SCHEDULE ============ -->
      ${PROGRAMME_HTML}

      <!-- ============ SPECIAL INVITEE ============ -->
      ${SPECIAL_INVITEE_HTML}

      <!-- ============ CLOSING + FOOTER ============ -->
      ${FOOTER_HTML}

      <!-- ============ WEBSITE LINK ============ -->
      ${WEBSITE_BAR_HTML}

      <!-- ============ BOTTOM BAR ============ -->
      <tr>
        <td style="background-color: #0f1d3a; padding: 16px 40px; text-align: center;">
          <p style="margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 10px; color: #4a5568; line-height: 1.5;">
            &copy; ${new Date().getFullYear()} St. Xavier's College (Calcutta) Alumni Association &ndash; West Zone Chapter
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
  const personalized = bodyText.replace(/\{\{name\}\}/gi, displayName);

  return `${personalized}

────────────────────────────────────────

PROGRAMME SCHEDULE

 9:15 AM   Registration & Meet and Greet — Tea, Coffee and Vadapav awaits
10:30 AM   Lighting of the Lamp followed by the National Anthem
10:40 AM   Address by Rev. Dr. Dominic Savio, SJ — Principal SXC, President SXCCAA
10:45 AM   Welcome Message by Mr. Firdusal Hasan — Ex Secretary SXCCAA
10:55 AM   Welcome Message by Dr. Sanjay Goel — Secretary SXCCAA (West Zone Chapter)
11:05 AM   Special Address by Chief Guest Mr. Amit Haralka — CEO, ArcelorMittal Nippon Steel India
11:15 AM   Felicitation of Ms. Aswati Dorje, IPS — ADGP, Prevention of Crime Against Women & Children
11:35 AM   Keynote Address by Xaverian Mr. Robin Banerjee — Chairman, Nucleon Research Pvt Ltd
12:05 PM   Fireside Chat with Mr. Pankaj Tibrewal — Founder & CIO, IKIGAI Asset Manager
12:45 PM   Keynote Address & Felicitation of Ms. Priti Rathi Gupta — Founder, Lxme
 1:15 PM   Gala Lunch and Fellowship
 2:15 PM   SHAKTI SAMMAN — Felicitation of Awardees & Brief Address by them
 4:15 PM   Vote of Thanks by CA. Parimal Sheth
 4:25 PM   Sumptuous High Tea and Fellowship

────────────────────────────────────────

SPECIAL INVITEE
Ms. Ananya Birla
Director at Aditya Birla Group
Founder & Chairperson, Svatantra Microfin

────────────────────────────────────────

We look forward to welcoming you to Nostalgia '26 and sharing a memorable day of friendship, fellowship and the spirit of Xavierism.

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
export const DEFAULT_SUBJECT = "Invitation | Nostalgia '26 – Annual Alumni Reunion | 3rd October 2026";

/**
 * Default editable email body HTML for Nostalgia '26.
 * The programme schedule, special invitee, and footer are auto-appended — NOT part of this editable content.
 */
export const DEFAULT_BODY_HTML = `<p>Dear {{name}},</p>

<p>Warm greetings from the <strong>St. Xavier's College (Calcutta) Alumni Association – West Zone Chapter</strong>.</p>

<p>We are delighted to invite you to <strong>Nostalgia '26 – Annual Alumni Reunion</strong>, an occasion to reconnect with fellow Xaverians, reminisce about cherished memories and celebrate the enduring spirit of our alma mater.</p>

<p>We have put together an enriching programme featuring distinguished speakers, felicitations, meaningful conversations and opportunities for fellowship with fellow Xaverians.</p>`;
