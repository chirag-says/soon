'use client';

import React from 'react';

export interface SendStats {
  total: number;
  sent: number;
  delivered: number;
  bounced: number;
  failed: number;
  pending: number;
  rateLimited: boolean;
  isComplete: boolean;
  isSending: boolean;
}

interface SendProgressProps {
  stats: SendStats;
  onReset: () => void;
}

export default function SendProgress({ stats, onReset }: SendProgressProps) {
  const { total, sent, delivered, bounced, failed, pending, rateLimited, isComplete, isSending } = stats;
  const progressPercent = total > 0 ? Math.round((sent / total) * 100) : 0;

  return (
    <div className="animate-slide-up">
      {/* Status Header */}
      <div className="text-center mb-8">
        {isSending ? (
          <>
            <div className="w-12 h-12 rounded-full bg-gold-500/10 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-gold-500 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>
            <h3 className="text-xl font-serif font-bold text-navy-900">Sending Emails...</h3>
            <p className="text-sm text-navy-400 mt-1">{sent} of {total} processed</p>
          </>
        ) : isComplete ? (
          <>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${
              failed > 0 || bounced > 0 ? 'bg-amber-100' : 'bg-emerald-100'
            }`}>
              {failed > 0 || bounced > 0 ? (
                <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              ) : (
                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </div>
            <h3 className="text-xl font-serif font-bold text-navy-900">
              {failed > 0 ? 'Campaign Completed with Issues' : 'Campaign Sent Successfully'}
            </h3>
            <p className="text-sm text-navy-400 mt-1">
              {sent} email{sent !== 1 ? 's' : ''} processed
            </p>
          </>
        ) : null}
      </div>

      {/* Rate Limit Warning */}
      {rateLimited && (
        <div className="mb-6 p-4 rounded-lg bg-amber-50 border border-amber-200">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-amber-800">Sending limit reached</p>
              <p className="text-xs text-amber-600 mt-1">
                Resend has reached its current sending limit. Please try again when your sending quota becomes available.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        <StatCard label="Total" value={total} icon="📤" />
        <StatCard label="Sent" value={sent} icon="✉️" color="blue" />
        <StatCard label="Delivered" value={delivered} icon="✅" color="green" />
        <StatCard label="Bounced" value={bounced} icon="↩️" color="amber" />
        <StatCard label="Failed" value={failed} icon="❌" color="red" />
      </div>

      {/* Pending indicator */}
      {pending > 0 && (
        <div className="mb-6 flex items-center gap-2 justify-center">
          <div className="w-2 h-2 rounded-full bg-navy-400 animate-pulse-gentle" />
          <p className="text-sm text-navy-400">
            {pending} email{pending !== 1 ? 's' : ''} pending delivery confirmation
          </p>
        </div>
      )}

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-navy-500">Progress</span>
          <span className="text-xs font-semibold text-navy-700 tabular-nums">{sent} / {total}</span>
        </div>
        <div className="h-3 bg-navy-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ease-out ${
              isComplete
                ? failed > 0 ? 'bg-gradient-to-r from-amber-400 to-amber-500' : 'bg-gradient-to-r from-emerald-400 to-emerald-500'
                : 'bg-gradient-to-r from-gold-400 to-gold-500'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Status Legend */}
      <div className="p-4 rounded-lg bg-navy-50/50 border border-navy-100 mb-6">
        <p className="text-xs font-semibold text-navy-500 uppercase tracking-wider mb-3">Status Guide</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-400" />
            <span className="text-navy-500"><strong>Sent:</strong> Accepted by Resend</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-navy-500"><strong>Delivered:</strong> Reached inbox</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span className="text-navy-500"><strong>Bounced:</strong> Could not deliver</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-400" />
            <span className="text-navy-500"><strong>Failed:</strong> Sending error</span>
          </div>
        </div>
      </div>

      {/* Reset Button */}
      {isComplete && (
        <div className="text-center">
          <button
            type="button"
            onClick={onReset}
            className="px-6 py-2.5 rounded-lg bg-navy-900 text-white text-sm font-medium
              hover:bg-navy-800 active:bg-navy-950 transition-colors"
          >
            Send Another Campaign
          </button>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, icon, color }: {
  label: string;
  value: number;
  icon: string;
  color?: string;
}) {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-50 border-blue-100',
    green: 'bg-emerald-50 border-emerald-100',
    amber: 'bg-amber-50 border-amber-100',
    red: 'bg-red-50 border-red-100',
  };

  return (
    <div className={`rounded-lg border p-4 text-center ${
      color ? colorClasses[color] : 'bg-navy-50 border-navy-100'
    }`}>
      <p className="text-lg mb-1">{icon}</p>
      <p className="text-2xl font-bold text-navy-900 tabular-nums">{value}</p>
      <p className="text-xs font-medium text-navy-500 mt-0.5">{label}</p>
    </div>
  );
}
