# SXCCAA Email Communication

**St. Xavier's College (Calcutta) Alumni Association – West Zone Chapter**

A secure, production-ready email communication tool for sending personalised emails to alumni networks via [Resend](https://resend.com).

---

## Features

- **Upload CSV/Excel** — Drag & drop `.csv`, `.xlsx`, or `.xls` files
- **Smart Column Extraction** — Only `Name` and `Email` columns are extracted; all other data is discarded
- **Validation & Deduplication** — Invalid emails rejected, duplicates removed (case-insensitive)
- **Rich Email Composer** — Bold, italic, headings, lists, links, and `{{name}}` personalisation
- **Premium HTML Emails** — Compatible with Gmail, Outlook, Apple Mail, and mobile clients
- **Auto Footer** — Dr. Sanjay Goel's signature with SXCCAA website link automatically appended
- **Email Preview** — Desktop and mobile preview modes
- **Test Email** — Send a test to yourself before sending to all recipients
- **Individual Sending** — Each recipient gets their own email (no CC/BCC)
- **Live Progress** — Real-time sent/delivered/bounced/failed counters
- **Rate Limit Handling** — Graceful handling of Resend sending limits
- **No Database** — Recipient data is never permanently stored

---

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Create Environment Variables

Copy the example file:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your values:

```env
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=alumni@yourdomain.com
RESEND_FROM_NAME=SXCCAA West Zone
```

### 3. Get Your Resend API Key

1. Sign up at [resend.com](https://resend.com)
2. Go to **API Keys** → **Create API Key**
3. Copy the key (starts with `re_`)
4. Paste it as `RESEND_API_KEY` in `.env.local`

### 4. Configure Verified Sender

Your `RESEND_FROM_EMAIL` must be a verified sender in Resend:

1. Go to **Domains** in your Resend dashboard
2. Add and verify your domain
3. Use an email address from that domain as `RESEND_FROM_EMAIL`

> **Note:** For testing, Resend provides `onboarding@resend.dev` as a default sender.

### 5. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## How It Works

### CSV/Excel Upload

The application accepts files with any number of columns. It searches for columns matching common variations of "Name" and "Email":

**Recognised Name columns:** `Name`, `Full Name`, `First Name`, `Recipient Name`, `Member Name`, `Alumni Name`

**Recognised Email columns:** `Email`, `E-mail`, `Email Address`, `Mail`, `Email ID`

All other columns (Phone, Company, Address, ID, etc.) are **completely ignored** and never stored or transmitted.

### Name Personalisation

Use `{{name}}` in your email body:

```
Dear {{name}},
```

This becomes:
- **With name:** "Dear Rahul Sharma,"
- **Without name:** "Dear Xaverian,"

### Resend Sending

- Each recipient receives an **individual email** (no CC/BCC)
- Emails are sent in batches of 5 with delays to respect rate limits
- The Resend API key is **never** exposed to the browser

### Delivery Status

| Status | Meaning |
|--------|---------|
| **Sent** | Resend accepted the email for delivery |
| **Delivered** | The receiving mail server accepted the email |
| **Bounced** | The email could not be delivered |
| **Failed** | The sending operation encountered an error |
| **Pending** | Delivery status not yet confirmed |

### Webhook Configuration (Optional)

To receive real-time delivery status updates:

1. Deploy the application
2. In your Resend dashboard, go to **Webhooks**
3. Add endpoint: `https://yourdomain.com/api/webhook`
4. Subscribe to events: `email.sent`, `email.delivered`, `email.bounced`, `email.delivery_delayed`

Without webhooks, sent emails will show as "Pending" for delivery status.

---

## Deployment to Vercel

### 1. Push to GitHub

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

### 2. Deploy on Vercel

1. Import your repository at [vercel.com](https://vercel.com)
2. Framework: **Next.js** (auto-detected)
3. Add environment variables:

| Variable | Description |
|----------|-------------|
| `RESEND_API_KEY` | Your Resend API key |
| `RESEND_FROM_EMAIL` | Verified sender email |
| `RESEND_FROM_NAME` | Sender display name (e.g., `SXCCAA West Zone`) |

4. Deploy

### 3. Configure Webhook (Post-Deploy)

After deployment, configure the Resend webhook to point to:

```
https://your-vercel-domain.vercel.app/api/webhook
```

---

## Security Considerations

- ✅ `RESEND_API_KEY` is server-side only — never included in client-side JavaScript
- ✅ `.env.local` is gitignored — API keys are never committed
- ✅ Only `Name` and `Email` are extracted from uploaded files
- ✅ All other columns in Excel/CSV files are completely discarded
- ✅ Recipient emails are not logged to console
- ✅ Recipient emails are not included in URLs
- ✅ Uploaded files are not permanently stored
- ✅ There is no database — recipient data is temporary
- ✅ Each recipient receives an individually-addressed email
- ✅ CC and BCC are never used for bulk recipients
- ✅ Email addresses are partially masked in the preview table
- ✅ Duplicate send protection prevents accidental double-sends
- ✅ The website is set to `noindex, nofollow` for privacy

### Recipient Data Handling

Uploaded CSV/Excel files are processed entirely in the browser. Only the extracted `Name` and `Email` fields are sent to the server API for sending. No recipient data is permanently stored by this application.

> **Note:** Resend (the email service) may retain delivery logs according to its own data retention policies.

---

## Avoiding Duplicate Campaigns

- The Send button is disabled while a campaign is being sent
- A server-side lock prevents concurrent campaigns
- A confirmation dialog requires explicit user confirmation before sending
- If you accidentally navigate away, the browser's temporary state is cleared

---

## Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout with fonts and metadata
│   ├── page.tsx            # Main single-page application
│   ├── globals.css         # Design system and global styles
│   └── api/
│       ├── send/route.ts   # Bulk email sending endpoint
│       ├── test/route.ts   # Test email endpoint
│       └── webhook/route.ts # Resend delivery webhook handler
├── components/
│   ├── FileUploader.tsx    # Drag & drop file upload
│   ├── RecipientPreview.tsx # Validation summary and preview table
│   ├── EmailComposer.tsx   # Rich text editor with toolbar
│   ├── EmailPreview.tsx    # Desktop/mobile email preview modal
│   ├── SendProgress.tsx    # Live sending progress and statistics
│   └── Footer.tsx          # Page footer
└── lib/
    ├── email.ts            # HTML email template generator
    ├── excel.ts            # Excel/CSV parser (Name + Email only)
    ├── resend.ts           # Resend SDK integration
    └── validation.ts       # Email validation and sanitisation
```

---

## Tech Stack

- [Next.js](https://nextjs.org/) — React framework with server-side API routes
- [TypeScript](https://www.typescriptlang.org/) — Type safety
- [Tailwind CSS](https://tailwindcss.com/) — Styling
- [Resend](https://resend.com/) — Email delivery
- [XLSX (SheetJS)](https://sheetjs.com/) — Excel file parsing
- [PapaParse](https://www.papaparse.com/) — CSV parsing

---

## License

Private — St. Xavier's College (Calcutta) Alumni Association – West Zone Chapter
