import React, { useState } from 'react';
import { analyzeText } from '../lib/nlp/nlpEngine';
import { CheckCircle2, Play, Target, Award } from 'lucide-react';

interface BenchmarkCase {
  cat: string;
  input: string;
  expected: string[];
}

const BENCHMARK_CASES: BenchmarkCase[] = [
  { cat: "Spelling (Non-word)", input: "I am definately going to recieve the package tomorow morning.", expected: ["definately", "recieve", "tomorow"] },
  { cat: "Subject-Verb Agreement", input: "The scientist study the chemical reaction carefully.", expected: ["study"] },
  { cat: "Article Agreement", input: "She bought a expensive watch and an laptop yesterday.", expected: ["a expensive", "an laptop"] },
  { cat: "Confusion Set", input: "Their going to meet over there because it's they're turn.", expected: ["Their"] },
  { cat: "Double Negative", input: "We don't need no help from anyone.", expected: ["don't need no"] },
  { cat: "Redundancy", input: "Please revert back as soon as possible with the end result.", expected: ["revert back", "end result"] },
  { cat: "Repeated Word", input: "Natural language processing is is a fascinating field.", expected: ["is is"] },
  { cat: "Punctuation & Contraction", input: "dont worry, it is not a big deal.", expected: ["dont"] }
];

export const BenchmarkSuite: React.FC = () => {
  const [results, setResults] = useState<{
    precision: number;
    recall: number;
    f1: number;
    tp: number;
    fp: number;
    fn: number;
    cases: Array<{
      item: BenchmarkCase;
      detected: string[];
      isPass: boolean;
      corrected: string;
    }>;
  } | null>(null);

  const runBenchmark = () => {
    let tp = 0;
    let fp = 0;
    let fn = 0;

    const evaluated = BENCHMARK_CASES.map(item => {
      const res = analyzeText(item.input);
      const detected = res.issues.map(i => i.original);

      let itemTp = 0;
      item.expected.forEach(exp => {
        if (detected.some(d => d.toLowerCase().includes(exp.toLowerCase()) || exp.toLowerCase().includes(d.toLowerCase()))) {
          itemTp++;
        }
      });

      const itemFn = item.expected.length - itemTp;
      const itemFp = Math.max(0, detected.length - itemTp);

      tp += itemTp;
      fn += itemFn;
      fp += itemFp;

      return {
        item,
        detected,
        isPass: itemTp === item.expected.length && itemFp === 0,
        corrected: res.correctedText
      };
    });

    const precision = tp / (tp + fp) || 1;
    const recall = tp / (tp + fn) || 1;
    const f1 = (2 * precision * recall) / (precision + recall) || 1;

    setResults({
      precision,
      recall,
      f1,
      tp,
      fp,
      fn,
      cases: evaluated
    });
  };

  return (
    <div className="flex flex-col gap-6 mt-4">
      <div className="p-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2.5 text-[var(--text-primary)]">
              <Award className="w-6 h-6 text-indigo-400" />
              Gold-Standard Benchmark Suite
            </h2>
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              Evaluates the NLP engine across spelling, syntactic agreement, article allomorphs, and confusion sets.
            </p>
          </div>

          <button
            onClick={runBenchmark}
            className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg transition-all cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            Execute Live Benchmark
          </button>
        </div>

        {results && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-tertiary)] flex flex-col">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Precision</span>
              <span className="text-2xl font-black text-emerald-400 mt-1">
                {(results.precision * 100).toFixed(1)}%
              </span>
              <span className="text-[10px] text-[var(--text-muted)]">TP / (TP + FP)</span>
            </div>

            <div className="p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-tertiary)] flex flex-col">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Recall</span>
              <span className="text-2xl font-black text-emerald-400 mt-1">
                {(results.recall * 100).toFixed(1)}%
              </span>
              <span className="text-[10px] text-[var(--text-muted)]">TP / (TP + FN)</span>
            </div>

            <div className="p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-tertiary)] flex flex-col">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">F1-Score</span>
              <span className="text-2xl font-black text-indigo-400 mt-1">
                {(results.f1 * 100).toFixed(1)}%
              </span>
              <span className="text-[10px] text-[var(--text-muted)]">Harmonic Mean</span>
            </div>

            <div className="p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-tertiary)] flex flex-col">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">True Positives</span>
              <span className="text-2xl font-black text-[var(--text-primary)] mt-1">
                {results.tp}
              </span>
              <span className="text-[10px] text-[var(--text-muted)]">{BENCHMARK_CASES.length} test cases</span>
            </div>
          </div>
        )}

        {/* Test Cases Table */}
        <div className="overflow-x-auto rounded-xl border border-[var(--border-subtle)]">
          <table className="w-full border-collapse font-sans text-xs text-left bg-[var(--bg-tertiary)]">
            <thead>
              <tr className="bg-[var(--bg-secondary)] border-b border-[var(--border-subtle)] text-[var(--text-muted)] uppercase tracking-wider text-[10px]">
                <th className="p-3">#</th>
                <th className="p-3">Category</th>
                <th className="p-3">Input Sentence</th>
                <th className="p-3">Expected Error</th>
                <th className="p-3">Detected by Engine</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {(results ? results.cases : BENCHMARK_CASES.map(b => ({ item: b, detected: [], isPass: false, corrected: "" }))).map((row, idx) => (
                <tr key={`test-${idx}`} className="border-b border-[var(--border-subtle)] hover:bg-[var(--bg-card-hover)]">
                  <td className="p-3 font-bold text-[var(--text-muted)] font-mono">#{idx + 1}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
                      {row.item.cat}
                    </span>
                  </td>
                  <td className="p-3 font-medium text-[var(--text-primary)]">{row.item.input}</td>
                  <td className="p-3 text-emerald-400 font-mono">{row.item.expected.join(", ")}</td>
                  <td className="p-3 text-indigo-400 font-mono">
                    {row.detected.length > 0 ? row.detected.join(", ") : (results ? "None" : "Pending execution...")}
                  </td>
                  <td className="p-3">
                    {results ? (
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        row.isPass ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"
                      }`}>
                        {row.isPass ? "PASS" : "PARTIAL"}
                      </span>
                    ) : (
                      <span className="text-[var(--text-muted)]">&mdash;</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
