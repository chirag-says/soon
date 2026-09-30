'use client';

import React, { useState, useCallback, useRef } from 'react';
import FileUploader from '@/components/FileUploader';
import RecipientPreview from '@/components/RecipientPreview';
import EmailComposer from '@/components/EmailComposer';
import EmailPreview from '@/components/EmailPreview';
import SendProgress, { type SendStats } from '@/components/SendProgress';
import Footer from '@/components/Footer';
import { DEFAULT_SUBJECT, DEFAULT_BODY_HTML } from '@/lib/email';
import type { Recipient, ValidationResult } from '@/lib/validation';

type AppStep = 'upload' | 'compose' | 'sending' | 'complete';

export default function HomePage() {
  // State
  const [step, setStep] = useState<AppStep>('upload');
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [subject, setSubject] = useState(DEFAULT_SUBJECT);
  const [bodyHtml, setBodyHtml] = useState(DEFAULT_BODY_HTML);
  const [showPreview, setShowPreview] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [testSending, setTestSending] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [sendStats, setSendStats] = useState<SendStats>({
    total: 0, sent: 0, delivered: 0, bounced: 0, failed: 0, pending: 0,
    rateLimited: false, isComplete: false, isSending: false,
  });

  // Prevent duplicate sends
  const sendingRef = useRef(false);

  const handleUploadComplete = useCallback((result: ValidationResult) => {
    setValidationResult(result);
  }, []);

  const handleRecipientsReady = useCallback((valid: Recipient[]) => {
    setRecipients(valid);
    if (valid.length > 0) {
      setStep('compose');
    }
  }, []);

  const handleSendTest = useCallback(async () => {
    if (!testEmail.trim() || testSending) return;
    setTestSending(true);
    setTestResult(null);

    try {
      const res = await fetch('/api/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testEmail: testEmail.trim(),
          subject,
          bodyHtml,
          testName: 'Test Recipient',
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setTestResult({ success: true, message: 'Test email sent successfully!' });
      } else {
        setTestResult({ success: false, message: data.error || 'Failed to send test email.' });
      }
    } catch {
      setTestResult({ success: false, message: 'Network error. Please check your connection.' });
    } finally {
      setTestSending(false);
    }
  }, [testEmail, subject, bodyHtml, testSending]);

  const handleSendAll = useCallback(async () => {
    // Prevent duplicate sends
    if (sendingRef.current) return;
    sendingRef.current = true;
    setShowConfirmation(false);
    setStep('sending');

    setSendStats({
      total: recipients.length,
      sent: 0, delivered: 0, bounced: 0, failed: 0,
      pending: 0, rateLimited: false, isComplete: false, isSending: true,
    });

    try {
      const res = await fetch('/api/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipients: recipients.map(r => ({ name: r.name, email: r.email })),
          subject,
          bodyHtml,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setSendStats(prev => ({
          ...prev,
          failed: prev.total,
          isSending: false,
          isComplete: true,
          rateLimited: data.error?.includes('limit') || false,
        }));
        return;
      }

      const sent = data.sent || 0;
      const failed = data.failed || 0;
      const pending = sent; // Initially all sent emails are pending delivery

      setSendStats({
        total: data.total || recipients.length,
        sent,
        delivered: 0, // Delivery confirmation comes from webhooks
        bounced: 0,
        failed,
        pending,
        rateLimited: data.rateLimited || false,
        isComplete: true,
        isSending: false,
      });

      // Poll for delivery statuses if we have email IDs
      if (data.statuses && data.statuses.length > 0) {
        const emailIds = data.statuses
          .filter((s: { id?: string }) => s.id)
          .map((s: { id: string }) => s.id);

        if (emailIds.length > 0) {
          pollDeliveryStatuses(emailIds, sent, failed);
        }
      }
    } catch {
      setSendStats(prev => ({
        ...prev,
        failed: prev.total,
        isSending: false,
        isComplete: true,
      }));
    } finally {
      sendingRef.current = false;
    }
  }, [recipients, subject, bodyHtml]);

  // Poll webhook endpoint for delivery status updates
  const pollDeliveryStatuses = useCallback((emailIds: string[], totalSent: number, totalFailed: number) => {
    let pollCount = 0;
    const maxPolls = 30; // Poll for up to 5 minutes
    const pollInterval = 10000; // Every 10 seconds

    const poll = async () => {
      if (pollCount >= maxPolls) return;
      pollCount++;

      try {
        const res = await fetch(`/api/webhook?ids=${emailIds.join(',')}`);
        const data = await res.json();

        if (data.statuses) {
          let delivered = 0;
          let bounced = 0;

          for (const id of emailIds) {
            const status = data.statuses[id];
            if (status === 'delivered') delivered++;
            else if (status === 'bounced') bounced++;
          }

          const pending = totalSent - delivered - bounced;

          setSendStats(prev => ({
            ...prev,
            delivered,
            bounced,
            pending: Math.max(0, pending),
          }));

          // Stop polling if all statuses are resolved
          if (delivered + bounced >= totalSent) return;
        }

        setTimeout(poll, pollInterval);
      } catch {
        // Silently continue polling
        setTimeout(poll, pollInterval);
      }
    };

    setTimeout(poll, 5000); // Start polling after 5 seconds
  }, []);

  const handleReset = useCallback(() => {
    setStep('upload');
    setValidationResult(null);
    setRecipients([]);
    setSubject(DEFAULT_SUBJECT);
    setBodyHtml(DEFAULT_BODY_HTML);
    setShowPreview(false);
    setTestEmail('');
    setTestSending(false);
    setTestResult(null);
    setShowConfirmation(false);
    setSendStats({
      total: 0, sent: 0, delivered: 0, bounced: 0, failed: 0, pending: 0,
      rateLimited: false, isComplete: false, isSending: false,
    });
  }, []);

  return (
    <div className="min-h-screen bg-ivory-200">
      {/* Header */}
      <header className="bg-navy-900 text-white">
        <div className="max-w-3xl mx-auto px-6 py-10 md:py-14">
          {/* SXCCAA Identity */}
          <div className="mb-8">
            <p className="text-gold-500 text-sm font-semibold tracking-[0.3em] uppercase">SXCCAA</p>
            <div className="mt-2 flex items-center gap-3">
              <div className="h-px flex-1 bg-gradient-to-r from-gold-500/40 to-transparent max-w-[60px]" />
            </div>
            <p className="mt-3 text-ivory-400 text-xs tracking-wide leading-relaxed">
              St. Xavier&apos;s College (Calcutta)<br />
              Alumni Association – West Zone Chapter
            </p>
          </div>

          {/* Main Heading */}
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-white tracking-tight">
            Email Communication
          </h1>
          <p className="mt-3 text-ivory-400 text-sm md:text-base leading-relaxed max-w-lg">
            Send communications securely to your alumni network.
          </p>
        </div>
        {/* Gold accent bar */}
        <div className="h-[3px] bg-gradient-to-r from-gold-500 via-gold-400 to-gold-500" />
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-6 py-10">
        {/* Step: Upload */}
        {step === 'upload' && (
          <section id="upload-section">
            <SectionHeading number="1" title="Upload Recipients" />
            <FileUploader
              onUploadComplete={handleUploadComplete}
              onRecipientsReady={handleRecipientsReady}
            />
            {validationResult && recipients.length > 0 && (
              <div className="mt-8">
                <RecipientPreview
                  validationResult={validationResult}
                  recipients={recipients}
                />
              </div>
            )}
          </section>
        )}

        {/* Step: Compose */}
        {step === 'compose' && (
          <>
            {/* Recipient Summary */}
            <section id="recipients-section" className="mb-10">
              <div className="flex items-center justify-between mb-4">
                <SectionHeading number="1" title="Recipients" />
                <button
                  type="button"
                  onClick={() => { setStep('upload'); setRecipients([]); setValidationResult(null); }}
                  className="text-xs text-gold-600 hover:text-gold-700 font-medium transition-colors"
                >
                  Change file
                </button>
              </div>
              {validationResult && (
                <RecipientPreview
                  validationResult={validationResult}
                  recipients={recipients}
                />
              )}
            </section>

            {/* Email Composer */}
            <section id="compose-section" className="mb-10">
              <SectionHeading number="2" title="Compose Email" />
              <EmailComposer
                subject={subject}
                bodyHtml={bodyHtml}
                onSubjectChange={setSubject}
                onBodyChange={setBodyHtml}
              />
            </section>

            {/* Preview Button */}
            <section id="preview-section" className="mb-10">
              <button
                type="button"
                onClick={() => setShowPreview(true)}
                className="w-full py-3.5 rounded-lg border-2 border-navy-200 text-navy-700 text-sm font-semibold
                  hover:border-gold-400 hover:text-gold-700 hover:bg-gold-500/5
                  active:bg-gold-500/10 transition-all duration-200"
              >
                Preview Email
              </button>
            </section>

            {/* Test Email */}
            <section id="test-section" className="mb-10">
              <SectionHeading number="3" title="Send Test Email" />
              <div className="p-5 rounded-lg border border-navy-100 bg-white">
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="email"
                    value={testEmail}
                    onChange={(e) => { setTestEmail(e.target.value); setTestResult(null); }}
                    placeholder="Enter test email address..."
                    className="flex-1 px-4 py-2.5 rounded-lg border border-navy-200 bg-white text-sm text-navy-900
                      focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500
                      transition-all placeholder:text-navy-300"
                  />
                  <button
                    type="button"
                    onClick={handleSendTest}
                    disabled={testSending || !testEmail.trim()}
                    className="px-5 py-2.5 rounded-lg bg-navy-800 text-white text-sm font-medium
                      hover:bg-navy-700 active:bg-navy-900 transition-colors
                      disabled:opacity-50 disabled:cursor-not-allowed
                      whitespace-nowrap"
                  >
                    {testSending ? 'Sending...' : 'Send Test'}
                  </button>
                </div>
                {testResult && (
                  <div className={`mt-3 p-3 rounded-md text-sm ${
                    testResult.success
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}>
                    {testResult.message}
                  </div>
                )}
              </div>
            </section>

            {/* Send All */}
            <section id="send-section">
              <SectionHeading number="4" title="Send Campaign" />
              <div className="p-6 rounded-lg border border-navy-100 bg-white text-center">
                <p className="text-sm text-navy-500 mb-1">Recipients ready to send:</p>
                <p className="text-4xl font-bold text-navy-900 tabular-nums mb-6">{recipients.length}</p>
                <button
                  type="button"
                  onClick={() => setShowConfirmation(true)}
                  disabled={sendingRef.current}
                  className="px-8 py-3.5 rounded-lg bg-gradient-to-b from-gold-500 to-gold-600 text-navy-900 text-sm font-bold
                    hover:from-gold-400 hover:to-gold-500 active:from-gold-600 active:to-gold-700
                    shadow-md hover:shadow-lg transition-all duration-200
                    disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wide"
                >
                  Send to {recipients.length} Recipient{recipients.length !== 1 ? 's' : ''}
                </button>
              </div>
            </section>
          </>
        )}

        {/* Step: Sending / Complete */}
        {(step === 'sending' || step === 'complete') && (
          <section id="progress-section">
            <SectionHeading number="" title="Campaign Sending" />
            <div className="p-6 rounded-lg border border-navy-100 bg-white">
              <SendProgress stats={sendStats} onReset={handleReset} />
            </div>
          </section>
        )}
      </main>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="absolute inset-0 bg-navy-950/60 backdrop-blur-sm" onClick={() => setShowConfirmation(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
            <div className="w-14 h-14 rounded-full bg-gold-500/10 flex items-center justify-center mx-auto mb-5">
              <svg className="w-7 h-7 text-gold-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            </div>
            <h3 className="text-lg font-serif font-bold text-navy-900 mb-2">Confirm Send</h3>
            <p className="text-sm text-navy-500 mb-6 leading-relaxed">
              You are about to send this email to <strong className="text-navy-800">{recipients.length}</strong> recipient{recipients.length !== 1 ? 's' : ''}.
              This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                type="button"
                onClick={() => setShowConfirmation(false)}
                className="px-5 py-2.5 rounded-lg border border-navy-200 text-navy-600 text-sm font-medium
                  hover:bg-navy-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSendAll}
                className="px-6 py-2.5 rounded-lg bg-gradient-to-b from-gold-500 to-gold-600 text-navy-900 text-sm font-bold
                  hover:from-gold-400 hover:to-gold-500 shadow-md transition-all"
              >
                Send Emails
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Email Preview Modal */}
      <EmailPreview
        subject={subject}
        bodyHtml={bodyHtml}
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
      />

      <Footer />
    </div>
  );
}

function SectionHeading({ number, title }: { number: string; title: string }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      {number && (
        <span className="w-7 h-7 rounded-full bg-navy-900 text-gold-400 text-xs font-bold flex items-center justify-center shrink-0">
          {number}
        </span>
      )}
      <h2 className="text-lg font-serif font-bold text-navy-900">{title}</h2>
      <div className="flex-1 h-px bg-navy-100" />
    </div>
  );
}
