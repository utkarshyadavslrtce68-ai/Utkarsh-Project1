import React, { useRef, useEffect } from 'react';
import { Sparkles, Copy, Download, Trash2, CheckCircle } from 'lucide-react';
import { NLPIssue, ReadabilityMetrics } from '../lib/nlp/types';
import { SuggestionCard } from './SuggestionCard';

interface EditorWorkspaceProps {
  text: string;
  setText: (text: string) => void;
  issues: NLPIssue[];
  metrics: ReadabilityMetrics;
  correctedText: string;
  onApplySingle: (index: number) => void;
  onApplyAll: () => void;
  onIgnore: (index: number) => void;
  onInspectMatrix: (source: string, target: string) => void;
  onDictionaryAdded: () => void;
  onLoadPreset: (presetKey: string) => void;
}

export const EditorWorkspace: React.FC<EditorWorkspaceProps> = ({
  text,
  setText,
  issues,
  metrics,
  correctedText,
  onApplySingle,
  onApplyAll,
  onIgnore,
  onInspectMatrix,
  onDictionaryAdded,
  onLoadPreset
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightsRef = useRef<HTMLDivElement>(null);

  const syncScroll = () => {
    if (textareaRef.current && highlightsRef.current) {
      highlightsRef.current.scrollTop = textareaRef.current.scrollTop;
      highlightsRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  };

  useEffect(() => {
    syncScroll();
  }, [text]);

  const handleCopy = () => {
    navigator.clipboard.writeText(correctedText || text);
    alert("Corrected text copied to clipboard!");
  };

  const handleExport = () => {
    const blob = new Blob([correctedText || text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'corrected_text.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Render highlights backdrop HTML
  const renderHighlights = () => {
    if (!text) return null;
    const elements: React.ReactNode[] = [];
    let lastIndex = 0;

    issues.forEach((issue, idx) => {
      if (issue.start > lastIndex) {
        elements.push(
          <span key={`text-${lastIndex}`}>{text.substring(lastIndex, issue.start)}</span>
        );
      }

      let typeClass = "hl-spelling";
      if (issue.type === "GRAMMAR") typeClass = "hl-grammar";
      else if (issue.type === "STYLE" || issue.type === "CONFUSION_SET") typeClass = "hl-style";

      elements.push(
        <mark
          key={`issue-${idx}`}
          className={`hl-error ${typeClass}`}
          title={issue.explanation}
          onClick={() => {
            const card = document.getElementById(`issue-card-${idx}`);
            if (card) {
              card.scrollIntoView({ behavior: 'smooth', block: 'center' });
              card.classList.add('highlight-pulse');
              setTimeout(() => card.classList.remove('highlight-pulse'), 1200);
            }
          }}
        >
          {text.substring(issue.start, issue.end)}
        </mark>
      );

      lastIndex = issue.end;
    });

    if (lastIndex < text.length) {
      elements.push(<span key={`text-end`}>{text.substring(lastIndex)}</span>);
    }

    if (text.endsWith('\n')) {
      elements.push(<span key="trailing-nl">{'\n'}</span>);
    }

    return elements;
  };

  const spellingCount = issues.filter(i => i.type === 'SPELLING').length;
  const grammarCount = issues.filter(i => i.type === 'GRAMMAR').length;
  const styleCount = issues.filter(i => i.type === 'STYLE' || i.type === 'CONFUSION_SET').length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-4">
      {/* Left Pane: Editor */}
      <div className="lg:col-span-7 xl:col-span-8 flex flex-col h-[650px] rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] shadow-xl overflow-hidden">
        
        {/* Editor Toolbar */}
        <div className="flex flex-wrap items-center justify-between px-5 py-3 border-b border-[var(--border-subtle)] bg-[var(--bg-tertiary)] gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs text-[var(--text-muted)] font-medium">Sample:</span>
            <select
              onChange={(e) => onLoadPreset(e.target.value)}
              className="px-2.5 py-1 text-xs rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-secondary)] text-[var(--text-primary)] outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="college">College Essay (Spelling & Agreement)</option>
              <option value="business">Business Email (Tautology & Confusion)</option>
              <option value="academic">NLP Research Abstract (Syntax)</option>
              <option value="clean">Flawless Clean Writing</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onApplyAll}
              disabled={issues.length === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white shadow-md transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Auto-Fix All
            </button>

            <button
              onClick={handleCopy}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-indigo-500 transition-all cursor-pointer"
              title="Copy corrected text"
            >
              <Copy className="w-3.5 h-3.5" />
              Copy
            </button>

            <button
              onClick={handleExport}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-indigo-500 transition-all cursor-pointer"
              title="Export as .txt"
            >
              <Download className="w-3.5 h-3.5" />
              Export
            </button>

            <button
              onClick={() => setText("")}
              className="p-1.5 text-xs rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:text-rose-400 transition-all cursor-pointer"
              title="Clear text"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Dual-Layer Editor Body */}
        <div className="relative flex-1 w-full overflow-hidden">
          <div
            ref={highlightsRef}
            aria-hidden="true"
            className="absolute inset-0 p-6 text-[1.08rem] leading-[1.8] font-normal whitespace-pre-wrap break-words overflow-y-auto text-transparent pointer-events-auto select-none"
          >
            {renderHighlights()}
          </div>

          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onScroll={syncScroll}
            placeholder="Type or paste your text here to begin real-time spelling and grammar analysis..."
            spellCheck={false}
            autoComplete="off"
            autoCorrect="off"
            className="absolute inset-0 p-6 text-[1.08rem] leading-[1.8] font-normal whitespace-pre-wrap break-words overflow-y-auto bg-transparent text-[var(--text-primary)] outline-none resize-none caret-indigo-500 z-10"
          />
        </div>

        {/* Editor Footer */}
        <div className="flex items-center justify-between px-5 py-2.5 border-t border-[var(--border-subtle)] bg-[var(--bg-tertiary)] text-xs text-[var(--text-muted)]">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full font-bold text-[11px] bg-rose-500/15 text-rose-400">
              {spellingCount} Spelling
            </span>
            <span className="px-2 py-0.5 rounded-full font-bold text-[11px] bg-amber-500/15 text-amber-400">
              {grammarCount} Grammar
            </span>
            <span className="px-2 py-0.5 rounded-full font-bold text-[11px] bg-cyan-500/15 text-cyan-400">
              {styleCount} Style / Context
            </span>
          </div>
          <div>{metrics.wordCount} words / {metrics.sentenceCount} sentences</div>
        </div>
      </div>

      {/* Right Pane: Suggestions */}
      <div className="lg:col-span-5 xl:col-span-4 flex flex-col h-[650px]">
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="font-bold text-base flex items-center gap-2 text-[var(--text-primary)]">
            Linguistic Assistant
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-600 text-white">
              {issues.length}
            </span>
          </h2>
          <span className="text-xs text-[var(--text-muted)]">Live Assistant</span>
        </div>

        <div className="flex-1 overflow-y-auto flex flex-col gap-3 pr-1">
          {issues.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center rounded-2xl border border-dashed border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
              <CheckCircle className="w-12 h-12 text-emerald-400 mb-3" />
              <h3 className="font-bold text-lg text-[var(--text-primary)]">Flawless Text!</h3>
              <p className="text-xs text-[var(--text-muted)] mt-1 max-w-[260px]">
                No spelling mistakes or grammatical violations detected in your input.
              </p>
            </div>
          ) : (
            issues.map((issue, idx) => (
              <SuggestionCard
                key={issue.id}
                issue={issue}
                index={idx}
                onApply={onApplySingle}
                onIgnore={onIgnore}
                onInspectMatrix={onInspectMatrix}
                onDictionaryAdded={onDictionaryAdded}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};
