'use client';

import React from 'react';
import type { ValidationResult, Recipient } from '@/lib/validation';

interface RecipientPreviewProps {
  validationResult: ValidationResult;
  recipients: Recipient[];
}

export default function RecipientPreview({ validationResult, recipients }: RecipientPreviewProps) {
  const { totalFound, valid, invalid, duplicatesRemoved } = validationResult;
  const previewRecipients = recipients.slice(0, 10);

  return (
    <div className="animate-slide-up">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <SummaryCard
          label="Recipients Found"
          value={totalFound}
          color="navy"
        />
        <SummaryCard
          label="Valid Emails"
          value={valid.length}
          color="green"
        />
        <SummaryCard
          label="Invalid Emails"
          value={invalid.length}
          color="red"
        />
        <SummaryCard
          label="Duplicates Removed"
          value={duplicatesRemoved}
          color="amber"
        />
      </div>

      {/* Invalid Email Warnings */}
      {invalid.length > 0 && (
        <div className="mb-6 p-4 rounded-lg bg-amber-50 border border-amber-200">
          <div className="flex items-start gap-2">
            <svg className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-amber-800">
                {invalid.length} email{invalid.length > 1 ? 's' : ''} will not be sent
              </p>
              <p className="text-xs text-amber-600 mt-0.5">
                Invalid email addresses are automatically excluded.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Preview Table */}
      <div className="rounded-lg border border-navy-100 overflow-hidden bg-white">
        <div className="px-5 py-3 bg-navy-50/50 border-b border-navy-100">
          <p className="text-xs font-semibold text-navy-500 uppercase tracking-wider">
            Recipient Preview {recipients.length > 10 && `(showing 10 of ${recipients.length})`}
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-navy-100">
                <th className="text-left text-xs font-semibold text-navy-500 uppercase tracking-wider px-5 py-3">#</th>
                <th className="text-left text-xs font-semibold text-navy-500 uppercase tracking-wider px-5 py-3">Name</th>
                <th className="text-left text-xs font-semibold text-navy-500 uppercase tracking-wider px-5 py-3">Email</th>
              </tr>
            </thead>
            <tbody>
              {previewRecipients.map((r, i) => (
                <tr key={i} className="border-b border-navy-50 last:border-0 hover:bg-ivory-50 transition-colors">
                  <td className="px-5 py-3 text-sm text-navy-400 tabular-nums">{i + 1}</td>
                  <td className="px-5 py-3 text-sm font-medium text-navy-800">{r.name || '—'}</td>
                  <td className="px-5 py-3 text-sm text-navy-500">{maskEmailForDisplay(r.email)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {recipients.length > 10 && (
          <div className="px-5 py-3 bg-navy-50/30 border-t border-navy-100">
            <p className="text-xs text-navy-400">
              + {recipients.length - 10} more recipient{recipients.length - 10 > 1 ? 's' : ''}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryCard({ label, value, color }: { label: string; value: number; color: string }) {
  const colorMap: Record<string, { bg: string; text: string; value: string }> = {
    navy: { bg: 'bg-navy-50', text: 'text-navy-600', value: 'text-navy-900' },
    green: { bg: 'bg-emerald-50', text: 'text-emerald-600', value: 'text-emerald-700' },
    red: { bg: 'bg-red-50', text: 'text-red-500', value: 'text-red-600' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-600', value: 'text-amber-700' },
  };

  const colors = colorMap[color] || colorMap.navy;

  return (
    <div className={`rounded-lg ${colors.bg} p-4 text-center`}>
      <p className={`text-2xl font-bold ${colors.value} tabular-nums`}>{value}</p>
      <p className={`text-xs font-medium ${colors.text} mt-1`}>{label}</p>
    </div>
  );
}

/**
 * Partially masks email for display in the preview table.
 * Shows enough to identify, but protects privacy.
 */
function maskEmailForDisplay(email: string): string {
  const [local, domain] = email.split('@');
  if (!domain) return '***';
  const maskedLocal = local.length <= 3
    ? local[0] + '••'
    : local.slice(0, 2) + '••' + local.slice(-1);
  return `${maskedLocal}@${domain}`;
}
