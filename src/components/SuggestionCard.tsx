import React from 'react';
import { ArrowRight, PlusCircle, Eye } from 'lucide-react';
import { NLPIssue } from '../lib/nlp/types';
import { addToCustomDictionary } from '../lib/nlp/dictionary';

interface SuggestionCardProps {
  issue: NLPIssue;
  index: number;
  onApply: (index: number) => void;
  onIgnore: (index: number) => void;
  onInspectMatrix: (source: string, target: string) => void;
  onDictionaryAdded: () => void;
}

export const SuggestionCard: React.FC<SuggestionCardProps> = ({
  issue,
  index,
  onApply,
  onIgnore,
  onInspectMatrix,
  onDictionaryAdded
}) => {
  let badgeLabel = "Spelling";
  let badgeColor = "bg-rose-500/15 text-rose-400 border-rose-500/30";
  let borderColor = "border-l-rose-500";

  if (issue.type === "GRAMMAR") {
    badgeLabel = "Grammar";
    badgeColor = "bg-amber-500/15 text-amber-400 border-amber-500/30";
    borderColor = "border-l-amber-500";
  } else if (issue.type === "CONFUSION_SET") {
    badgeLabel = "Context Word";
    badgeColor = "bg-purple-500/15 text-purple-400 border-purple-500/30";
    borderColor = "border-l-purple-500";
  } else if (issue.type === "STYLE") {
    badgeLabel = "Style / Wordiness";
    badgeColor = "bg-cyan-500/15 text-cyan-400 border-cyan-500/30";
    borderColor = "border-l-cyan-500";
  }

  const handleAddDict = () => {
    addToCustomDictionary(issue.original);
    onDictionaryAdded();
  };

  return (
    <div
      id={`issue-card-${index}`}
      className={`p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] hover:bg-[var(--bg-card-hover)] transition-all shadow-md border-l-4 ${borderColor}`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${badgeColor}`}>
          {badgeLabel}
        </span>
        <span className="text-xs text-[var(--text-muted)]">{issue.category}</span>
      </div>

      <div className="flex items-center gap-2.5 my-2">
        <span className="line-through text-sm font-semibold text-[var(--text-muted)]">
          {issue.original}
        </span>
        <ArrowRight className="w-3.5 h-3.5 text-[var(--text-muted)]" />
        <button
          onClick={() => onApply(index)}
          className="px-3 py-1 text-sm font-bold rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500 hover:text-white transition-all cursor-pointer shadow-sm"
          title="Click to apply correction"
        >
          {issue.suggestion}
        </button>
      </div>

      <p className="text-xs leading-relaxed text-[var(--text-secondary)] mb-3">
        {issue.explanation}
      </p>

      <div className="flex items-center gap-2 pt-2 border-t border-[var(--border-subtle)] text-[11px]">
        <button
          onClick={() => onIgnore(index)}
          className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors px-1 py-0.5 rounded cursor-pointer"
        >
          Ignore
        </button>

        {issue.type === "SPELLING" && (
          <button
            onClick={handleAddDict}
            className="flex items-center gap-1 text-[var(--text-muted)] hover:text-indigo-400 transition-colors px-1 py-0.5 rounded cursor-pointer"
          >
            <PlusCircle className="w-3 h-3" />
            Add to Dict
          </button>
        )}

        <button
          onClick={() => onInspectMatrix(issue.original, issue.suggestion)}
          className="ml-auto flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-semibold transition-colors cursor-pointer"
        >
          <Eye className="w-3 h-3" />
          Inspect DP Matrix &rarr;
        </button>
      </div>
    </div>
  );
};
