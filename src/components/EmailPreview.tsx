'use client';

import React, { useState, useMemo } from 'react';
import { generateEmailHTML } from '@/lib/email';

interface EmailPreviewProps {
  subject: string;
  bodyHtml: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function EmailPreview({ subject, bodyHtml, isOpen, onClose }: EmailPreviewProps) {
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');

  const previewHtml = useMemo(() => {
    return generateEmailHTML(subject, bodyHtml, { name: 'Rahul Sharma', email: 'preview@example.com' });
  }, [subject, bodyHtml]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-navy-950/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-navy-100 bg-navy-50/30">
          <div>
            <h3 className="text-lg font-semibold text-navy-900 font-serif">Email Preview</h3>
            <p className="text-xs text-navy-400 mt-0.5">Preview how your email will appear to recipients</p>
          </div>
          <div className="flex items-center gap-3">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-navy-100 rounded-lg p-0.5">
              <button
                type="button"
                onClick={() => setViewMode('desktop')}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  viewMode === 'desktop'
                    ? 'bg-white text-navy-900 shadow-sm'
                    : 'text-navy-500 hover:text-navy-700'
                }`}
              >
                Desktop
              </button>
              <button
                type="button"
                onClick={() => setViewMode('mobile')}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  viewMode === 'mobile'
                    ? 'bg-white text-navy-900 shadow-sm'
                    : 'text-navy-500 hover:text-navy-700'
                }`}
              >
                Mobile
              </button>
            </div>
            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-navy-400 hover:text-navy-600 hover:bg-navy-100 transition-colors"
              aria-label="Close preview"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Email Metadata */}
        <div className="px-6 py-3 border-b border-navy-100 bg-ivory-50/50">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-navy-400 w-14">From:</span>
              <span className="text-xs text-navy-700">SXCCAA West Zone</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-navy-400 w-14">To:</span>
              <span className="text-xs text-navy-700">Rahul Sharma &lt;r••l@example.com&gt;</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-navy-400 w-14">Subject:</span>
              <span className="text-xs text-navy-700 font-medium">{subject || '(No subject)'}</span>
            </div>
          </div>
        </div>

        {/* Preview Frame */}
        <div className="flex-1 overflow-auto bg-gray-100 p-4 md:p-6">
          <div className={`mx-auto transition-all duration-300 ${
            viewMode === 'desktop' ? 'max-w-[700px]' : 'max-w-[375px]'
          }`}>
            <div className="email-preview-frame">
              <iframe
                srcDoc={previewHtml}
                className="w-full border-0"
                style={{ minHeight: viewMode === 'desktop' ? '600px' : '700px' }}
                title="Email preview"
                sandbox="allow-same-origin"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
