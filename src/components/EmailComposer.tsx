'use client';

import React, { useRef, useCallback } from 'react';

interface EmailComposerProps {
  subject: string;
  bodyHtml: string;
  onSubjectChange: (subject: string) => void;
  onBodyChange: (html: string) => void;
}

export default function EmailComposer({
  subject,
  bodyHtml,
  onSubjectChange,
  onBodyChange,
}: EmailComposerProps) {
  const editorRef = useRef<HTMLDivElement>(null);

  const execCommand = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value);
    // Sync content after command
    if (editorRef.current) {
      onBodyChange(editorRef.current.innerHTML);
    }
    editorRef.current?.focus();
  }, [onBodyChange]);

  const handleEditorInput = useCallback(() => {
    if (editorRef.current) {
      onBodyChange(editorRef.current.innerHTML);
    }
  }, [onBodyChange]);

  const handleEditorPaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    // Paste as clean HTML, stripping dangerous elements
    const html = e.clipboardData.getData('text/html');
    const text = e.clipboardData.getData('text/plain');

    if (html) {
      // Basic sanitization of pasted HTML
      const cleaned = html
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/\bon\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]*)/gi, '');
      document.execCommand('insertHTML', false, cleaned);
    } else {
      document.execCommand('insertText', false, text);
    }

    if (editorRef.current) {
      onBodyChange(editorRef.current.innerHTML);
    }
  }, [onBodyChange]);

  const insertPersonalization = useCallback(() => {
    document.execCommand('insertText', false, '{{name}}');
    if (editorRef.current) {
      onBodyChange(editorRef.current.innerHTML);
    }
    editorRef.current?.focus();
  }, [onBodyChange]);

  const handleInsertLink = useCallback(() => {
    const url = prompt('Enter URL:');
    if (url) {
      const text = document.getSelection()?.toString() || url;
      document.execCommand(
        'insertHTML',
        false,
        `<a href="${url}" style="color: #b0923e; text-decoration: underline;">${text}</a>`
      );
      if (editorRef.current) {
        onBodyChange(editorRef.current.innerHTML);
      }
    }
  }, [onBodyChange]);

  return (
    <div className="animate-slide-up">
      {/* Subject Field */}
      <div className="mb-4">
        <label htmlFor="email-subject" className="block text-sm font-semibold text-navy-700 mb-2">
          Subject
        </label>
        <input
          id="email-subject"
          type="text"
          value={subject}
          onChange={(e) => onSubjectChange(e.target.value)}
          className="w-full px-4 py-3 rounded-lg border border-navy-200 bg-white text-navy-900 text-sm
            focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500
            transition-all duration-200 placeholder:text-navy-300"
          placeholder="Enter email subject..."
        />
      </div>

      {/* Editor Toolbar */}
      <div className="mb-0">
        <label className="block text-sm font-semibold text-navy-700 mb-2">
          Email Message
        </label>
        <div className="rounded-lg border border-navy-200 bg-white overflow-hidden focus-within:ring-2 focus-within:ring-gold-500/30 focus-within:border-gold-500 transition-all duration-200">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-navy-100 bg-navy-50/30">
            <ToolbarButton onClick={() => execCommand('bold')} title="Bold" icon="B" bold />
            <ToolbarButton onClick={() => execCommand('italic')} title="Italic" icon="I" italic />
            <ToolbarDivider />
            <ToolbarButton onClick={() => execCommand('formatBlock', '<h2>')} title="Heading" icon="H" />
            <ToolbarButton onClick={() => execCommand('formatBlock', '<p>')} title="Paragraph" icon="¶" />
            <ToolbarDivider />
            <ToolbarButton onClick={() => execCommand('insertUnorderedList')} title="Bullet List" icon="•" />
            <ToolbarButton onClick={() => execCommand('insertOrderedList')} title="Numbered List" icon="1." />
            <ToolbarDivider />
            <ToolbarButton onClick={handleInsertLink} title="Insert Link" icon="🔗" />
            <ToolbarDivider />
            <button
              onClick={insertPersonalization}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium
                bg-gold-500/10 text-gold-700 hover:bg-gold-500/20 transition-colors"
              title="Insert recipient name variable"
              type="button"
            >
              <span className="text-[10px]">{'{{'}name{'}}'}</span>
            </button>
          </div>

          {/* Editor */}
          <div
            ref={editorRef}
            contentEditable
            className="email-editor"
            onInput={handleEditorInput}
            onPaste={handleEditorPaste}
            dangerouslySetInnerHTML={{ __html: bodyHtml }}
            role="textbox"
            aria-label="Email body editor"
            aria-multiline="true"
          />
        </div>
      </div>

      {/* Auto-appended Content Preview */}
      <div className="mt-4 rounded-lg border border-navy-100 overflow-hidden">
        <div className="px-4 py-3 bg-navy-50/50 border-b border-navy-100">
          <p className="text-xs font-semibold text-navy-500 uppercase tracking-wider">
            Auto-appended after your message
          </p>
        </div>

        {/* Programme Schedule Preview */}
        <div className="px-4 py-3 bg-navy-900 text-center">
          <p className="text-[10px] font-semibold text-gold-500 uppercase tracking-[2px]">Programme Schedule</p>
        </div>
        <div className="divide-y divide-navy-50">
          {[
            ['9:15 AM', 'Registration & Meet and Greet'],
            ['10:30 AM', 'Lighting of the Lamp'],
            ['10:40 AM', 'Address by Rev. Dr. Dominic Savio, SJ'],
            ['11:05 AM', 'Special Address by Chief Guest Mr. Amit Haralka'],
            ['11:35 AM', 'Keynote Address by Mr. Robin Banerjee'],
            ['12:05 PM', 'Fireside Chat with Mr. Pankaj Tibrewal'],
            ['1:15 PM', 'Gala Lunch and Fellowship'],
            ['2:15 PM', 'SHAKTI SAMMAN'],
            ['4:25 PM', 'High Tea and Fellowship'],
          ].map(([time, desc], i) => (
            <div key={i} className={`flex gap-3 px-4 py-2 text-xs ${i % 2 ? 'bg-ivory-50' : 'bg-white'}`}>
              <span className="text-gold-600 font-semibold w-16 shrink-0">{time}</span>
              <span className="text-navy-600">{desc}</span>
            </div>
          ))}
          <div className="px-4 py-1.5 bg-navy-50/30 text-center">
            <span className="text-[10px] text-navy-400">+ 5 more programme items</span>
          </div>
        </div>

        {/* Special Invitee */}
        <div className="px-4 py-3 bg-navy-900 text-center">
          <p className="text-[10px] text-gold-500 uppercase tracking-[2px] mb-1">Special Invitee</p>
          <p className="text-sm font-semibold text-white">Ms. Ananya Birla</p>
          <p className="text-[11px] text-navy-300">Director at Aditya Birla Group</p>
        </div>

        {/* Footer Signature */}
        <div className="px-4 py-3 bg-white border-t border-gold-500/20">
          <p className="text-xs text-navy-400 italic mb-1.5">Warm regards,</p>
          <p className="text-xs font-semibold text-navy-700">Dr. Sanjay Goel</p>
          <p className="text-xs text-navy-500">Secretary, SXCCAA – West Zone Chapter</p>
          <p className="text-xs text-navy-500">Contact: 9321154661</p>
          <a href="https://www.sxccaa.org/" className="inline-block mt-2 text-gold-600 hover:text-gold-700 text-xs font-medium" target="_blank" rel="noopener noreferrer">
            Visit SXCCAA Website →
          </a>
        </div>
      </div>
    </div>
  );
}

function ToolbarButton({ onClick, title, icon, bold, italic }: {
  onClick: () => void;
  title: string;
  icon: string;
  bold?: boolean;
  italic?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className="w-8 h-8 rounded flex items-center justify-center text-sm text-navy-600
        hover:bg-navy-100 active:bg-navy-200 transition-colors"
    >
      <span className={`${bold ? 'font-bold' : ''} ${italic ? 'italic' : ''}`}>{icon}</span>
    </button>
  );
}

function ToolbarDivider() {
  return <div className="w-px h-5 bg-navy-200 mx-1" />;
}
