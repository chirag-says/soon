'use client';

import React from 'react';

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-navy-100">
      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left">
            <p className="text-xs font-semibold text-gold-600 tracking-widest uppercase mb-1">SXCCAA</p>
            <p className="text-xs text-navy-400">
              St. Xavier&apos;s College (Calcutta) Alumni Association – West Zone Chapter
            </p>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="https://www.sxccaa.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-gold-600 hover:text-gold-700 font-medium transition-colors"
            >
              sxccaa.org
            </a>
            <span className="text-navy-200">·</span>
            <p className="text-xs text-navy-400">
              © {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
