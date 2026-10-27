import React from 'react';
import { ReadabilityMetrics } from '../lib/nlp/types';

interface ReadabilityBarProps {
  metrics: ReadabilityMetrics;
}

export const ReadabilityBar: React.FC<ReadabilityBarProps> = ({ metrics }) => {
  let gaugeColor = "bg-rose-500";
  if (metrics.fleschEase >= 70) {
    gaugeColor = "bg-emerald-500";
  } else if (metrics.fleschEase >= 45) {
    gaugeColor = "bg-amber-500";
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-4 p-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] shadow-lg mt-6">
      <div className="flex flex-col gap-1">
        <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
          Flesch Reading Ease
        </span>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-black text-[var(--text-primary)]">
            {metrics.fleschEase}
          </span>
          <span className="text-xs text-[var(--text-secondary)]">/ 100</span>
        </div>
        <div className="w-full h-1.5 rounded-full bg-[var(--border-subtle)] overflow-hidden mt-1">
          <div
            className={`h-full rounded-full transition-all duration-500 ${gaugeColor}`}
            style={{ width: `${Math.min(100, metrics.fleschEase)}%` }}
          />
        </div>
        <span className="text-[10px] text-[var(--text-muted)] mt-0.5">{metrics.label}</span>
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
          Grade Level
        </span>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-black text-[var(--text-primary)]">
            Grade {metrics.fleschGrade}
          </span>
        </div>
        <span className="text-[10px] text-[var(--text-muted)]">US Educational Standard</span>
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
          Lexical Diversity
        </span>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-black text-[var(--text-primary)]">
            {Math.round(metrics.lexicalDiversity * 100)}%
          </span>
        </div>
        <span className="text-[10px] text-[var(--text-muted)]">
          Type-Token Ratio ({metrics.uniqueWords} unique)
        </span>
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
          Reading Time
        </span>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-black text-[var(--text-primary)]">
            {metrics.readingTimeSec}s
          </span>
        </div>
        <span className="text-[10px] text-[var(--text-muted)]">
          {metrics.wordCount} words / {metrics.sentenceCount} sent.
        </span>
      </div>

      <div className="hidden lg:flex flex-col justify-center text-xs text-[var(--text-secondary)] leading-relaxed border-l border-[var(--border-subtle)] pl-4">
        <span className="font-semibold text-indigo-400">NLP Engine Active</span>
        <span>Peter Norvig Bayesian Model + Levenshtein DP + Syntactic SVA Rules</span>
      </div>
    </div>
  );
};
