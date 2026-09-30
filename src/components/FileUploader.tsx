'use client';

import React, { useCallback, useState, useRef } from 'react';
import { parseFile } from '@/lib/excel';
import { validateRecipients, type Recipient, type ValidationResult } from '@/lib/validation';

interface FileUploaderProps {
  onUploadComplete: (result: ValidationResult) => void;
  onRecipientsReady: (recipients: Recipient[]) => void;
}

export default function FileUploader({ onUploadComplete, onRecipientsReady }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(async (file: File) => {
    setIsProcessing(true);
    setError(null);
    setFileName(file.name);

    try {
      // Parse file — extracts ONLY name and email
      const { recipients: rawRecipients, error: parseError } = await parseFile(file);

      if (parseError) {
        setError(parseError);
        setIsProcessing(false);
        return;
      }

      if (rawRecipients.length === 0) {
        setError('No recipients found in the uploaded file.');
        setIsProcessing(false);
        return;
      }

      // Validate and deduplicate — only name + email retained
      const result = validateRecipients(rawRecipients);
      onUploadComplete(result);
      onRecipientsReady(result.valid);
    } catch {
      setError('Failed to process the file. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  }, [onUploadComplete, onRecipientsReady]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFile(files[0]);
    }
  }, [processFile]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
    // Reset input so the same file can be re-uploaded
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [processFile]);

  return (
    <div className="animate-fade-in">
      {/* Upload Area */}
      <div
        className={`
          relative rounded-xl border-2 border-dashed transition-all duration-300 cursor-pointer
          ${isDragging
            ? 'border-gold-500 bg-ivory-100 scale-[1.01]'
            : 'border-navy-200 bg-white hover:border-gold-400 hover:bg-ivory-50'
          }
          ${isProcessing ? 'pointer-events-none opacity-60' : ''}
        `}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        role="button"
        tabIndex={0}
        aria-label="Upload recipient list"
      >
        <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
          {/* Upload Icon */}
          <div className={`
            w-16 h-16 rounded-full flex items-center justify-center mb-5 transition-colors duration-300
            ${isDragging ? 'bg-gold-500/20' : 'bg-navy-50'}
          `}>
            {isProcessing ? (
              <svg className="w-7 h-7 text-gold-500 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              <svg className={`w-7 h-7 transition-colors ${isDragging ? 'text-gold-500' : 'text-navy-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
            )}
          </div>

          {isProcessing ? (
            <>
              <p className="text-base font-medium text-navy-700">Processing file...</p>
              <p className="text-sm text-navy-400 mt-1">{fileName}</p>
            </>
          ) : fileName && !error ? (
            <>
              <p className="text-base font-medium text-navy-700">File uploaded successfully</p>
              <p className="text-sm text-navy-400 mt-1">{fileName}</p>
              <p className="text-xs text-gold-600 mt-3 font-medium">Drop a new file or click to replace</p>
            </>
          ) : (
            <>
              <p className="text-base font-medium text-navy-800">Upload your recipient list</p>
              <p className="text-sm text-navy-400 mt-1.5 max-w-sm">
                Drag & drop your CSV or Excel file here, or browse your files.
              </p>
              <div className="flex items-center gap-2 mt-4">
                <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-navy-50 text-xs font-medium text-navy-600">.csv</span>
                <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-navy-50 text-xs font-medium text-navy-600">.xlsx</span>
                <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-navy-50 text-xs font-medium text-navy-600">.xls</span>
              </div>
            </>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.xlsx,.xls"
          className="hidden"
          onChange={handleFileInput}
          aria-hidden="true"
        />
      </div>

      {/* Error Display */}
      {error && (
        <div className="mt-4 p-4 rounded-lg bg-red-50 border border-red-200 animate-fade-in">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-red-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-red-800">{error}</p>
              <p className="text-xs text-red-600 mt-1">Please check your file and try again.</p>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Notice */}
      <p className="mt-4 text-xs text-navy-400 text-center leading-relaxed">
        Recipient information is used only for this email campaign and is not stored permanently by this application.
      </p>
    </div>
  );
}
