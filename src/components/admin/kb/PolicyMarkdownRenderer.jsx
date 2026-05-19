import React, { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';

/**
 * Renders KB markdown with three custom callout types and styled blockquotes.
 *
 * Custom callout syntax in source markdown:
 *   :::hitno      → red urgent callout
 *   :::ne-raditi  → amber "do not" callout
 *   :::pravnik    → blue lawyer callout
 *
 * Blockquotes (`>`) render as Croatian template messages with slate styling.
 */

const CALLOUT_CONFIG = {
  hitno: {
    emoji: '🚨',
    title: 'HITNO (URGENT)',
    className: 'bg-red-100 border-l-4 border-red-500 text-red-900',
    titleClassName: 'text-red-900',
  },
  'ne-raditi': {
    emoji: '⛔',
    title: 'NE RADITI (DO NOT)',
    className: 'bg-amber-100 border-l-4 border-amber-500 text-amber-900',
    titleClassName: 'text-amber-900',
  },
  pravnik: {
    emoji: '⚖️',
    title: 'PRAVNIK (LAWYER)',
    className: 'bg-blue-100 border-l-4 border-blue-500 text-blue-900',
    titleClassName: 'text-blue-900',
  },
};

/**
 * Split the markdown source into an array of segments:
 *   { type: 'md', content } | { type: 'callout', kind, content }
 *
 * Recognises top-level fenced ::: blocks. Nested ::: not supported (kept simple).
 */
function parseSegments(markdown) {
  if (!markdown) return [];
  const segments = [];
  const lines = markdown.split('\n');
  let buffer = [];
  let mode = 'md';
  let calloutKind = null;
  let calloutBuffer = [];

  const flushMd = () => {
    if (buffer.length) {
      segments.push({ type: 'md', content: buffer.join('\n') });
      buffer = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (mode === 'md') {
      const openMatch = line.match(/^:::(hitno|ne-raditi|pravnik)\s*$/);
      if (openMatch) {
        flushMd();
        mode = 'callout';
        calloutKind = openMatch[1];
        calloutBuffer = [];
        continue;
      }
      buffer.push(line);
    } else {
      if (/^:::\s*$/.test(line)) {
        segments.push({ type: 'callout', kind: calloutKind, content: calloutBuffer.join('\n') });
        mode = 'md';
        calloutKind = null;
        calloutBuffer = [];
        continue;
      }
      calloutBuffer.push(line);
    }
  }
  // Flush any trailing buffers (graceful even if a callout was unclosed)
  if (mode === 'callout' && calloutBuffer.length) {
    segments.push({ type: 'callout', kind: calloutKind, content: calloutBuffer.join('\n') });
  } else {
    flushMd();
  }
  return segments;
}

// Markdown render components for react-markdown
const mdComponents = {
  h1: ({ node, ...props }) => (
    <h1 className="font-display text-3xl font-bold text-foreground mt-8 mb-4" {...props} />
  ),
  h2: ({ node, ...props }) => (
    <h2 className="font-display text-2xl font-semibold text-primary mt-10 mb-4" {...props} />
  ),
  h3: ({ node, ...props }) => (
    <h3 className="text-xl font-semibold text-foreground mt-8 mb-3 border-b border-border/40 pb-2" {...props} />
  ),
  h4: ({ node, ...props }) => (
    <h4 className="text-lg font-semibold text-foreground mt-6 mb-2" {...props} />
  ),
  p: ({ node, ...props }) => (
    <p className="text-base text-foreground/90 leading-relaxed my-3" {...props} />
  ),
  ul: ({ node, ordered, ...props }) => (
    <ul className="list-disc pl-6 my-4 space-y-1.5 text-base text-foreground/90 leading-relaxed" {...props} />
  ),
  ol: ({ node, ordered, ...props }) => (
    <ol className="list-decimal pl-6 my-4 space-y-1.5 text-base text-foreground/90 leading-relaxed" {...props} />
  ),
  li: ({ node, ...props }) => <li className="leading-relaxed" {...props} />,
  blockquote: ({ node, ...props }) => (
    <blockquote
      className="bg-slate-50 border-l-4 border-slate-300 text-slate-800 italic px-4 py-3 my-4 rounded-r-lg [&>p]:my-1 [&>p]:text-slate-800"
      {...props}
    />
  ),
  a: ({ node, href, ...props }) => {
    const isExternal = href && /^https?:\/\//.test(href);
    return (
      <a
        href={href}
        className="text-primary underline-offset-2 hover:underline"
        {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        {...props}
      />
    );
  },
  strong: ({ node, ...props }) => <strong className="font-semibold text-foreground" {...props} />,
  em: ({ node, ...props }) => <em className="italic" {...props} />,
  code: ({ node, inline, ...props }) =>
    inline ? (
      <code className="px-1.5 py-0.5 rounded bg-muted text-foreground text-sm" {...props} />
    ) : (
      <code className="block bg-muted p-3 rounded-lg text-sm overflow-x-auto" {...props} />
    ),
  hr: () => <hr className="my-8 border-border/60" />,
};

function Callout({ kind, content }) {
  const cfg = CALLOUT_CONFIG[kind];
  if (!cfg) return null;
  return (
    <div className={`${cfg.className} px-4 py-3 my-4 rounded-r-lg`}>
      <div className={`font-bold text-sm mb-1 ${cfg.titleClassName}`}>
        {cfg.emoji} {cfg.title}
      </div>
      <div className="[&>p:first-child]:mt-0 [&>p:last-child]:mb-0">
        <ReactMarkdown components={mdComponents}>{content}</ReactMarkdown>
      </div>
    </div>
  );
}

export default function PolicyMarkdownRenderer({ markdown }) {
  const segments = useMemo(() => parseSegments(markdown || ''), [markdown]);
  return (
    <div className="kb-prose">
      {segments.map((seg, i) =>
        seg.type === 'callout' ? (
          <Callout key={i} kind={seg.kind} content={seg.content} />
        ) : (
          <ReactMarkdown key={i} components={mdComponents}>{seg.content}</ReactMarkdown>
        )
      )}
    </div>
  );
}