import React, { useState } from 'react';
import { BookOpen, ChevronDown, ChevronUp } from 'lucide-react';

const VIVA_QA = [
  {
    q: "What is the primary difference between a Non-Word error and a Real-Word error?",
    a: "Non-word errors are invalid lexicon entries (e.g., 'recieve'), detected via dictionary lookup. Real-word errors are valid vocabulary words used incorrectly in context (e.g., 'their going'), requiring N-gram collocations or syntactic parsing."
  },
  {
    q: "Why is Dynamic Programming preferred for Levenshtein Distance?",
    a: "Naive recursion has overlapping subproblems causing exponential O(3^(m+n)) runtime. Dynamic programming stores intermediate prefix alignments in an (m+1)x(n+1) grid, reducing complexity to O(m*n)."
  },
  {
    q: "How does Peter Norvig's Bayesian Spelling Corrector select the best correction?",
    a: "It maximizes posterior probability: argmax P(c|w) = argmax [P(w|c) * P(c)]. P(c) is the prior probability from corpus word frequencies, and P(w|c) is the error likelihood parameterized by edit distances 1 and 2."
  },
  {
    q: "What is Damerau-Levenshtein distance?",
    a: "It adds transposition of two adjacent characters as an elementary operation costing 1. In standard Levenshtein, swapping adjacent letters costs 2 operations (delete + insert). Transpositions account for ~80% of human typing slips."
  },
  {
    q: "How does your system enforce Indefinite Article Agreement ('a' vs 'an')?",
    a: "It checks phonological sound rules rather than orthography alone. 'An' is required before vowel sounds, and 'a' before consonant sounds. It handles exceptions like 'an hour' (silent h) and 'a university' (palatal glide /j/)."
  },
  {
    q: "How are Precision, Recall, and F1-Score defined for grammar checking?",
    a: "Precision = TP / (TP + FP) measures what proportion of flagged errors were genuine. Recall = TP / (TP + FN) measures what proportion of all actual errors were detected. F1-Score is their harmonic mean."
  }
];

export const TheoryGuide: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="flex flex-col gap-6 mt-4">
      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <div className="p-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] shadow-lg">
          <h3 className="font-bold text-base text-indigo-400 mb-2">1. Minimum Edit Distance (Levenshtein)</h3>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-3">
            Computes the minimum insertion, deletion, and substitution operations to transform source into target string.
          </p>
          <div className="p-3 rounded-lg bg-[var(--bg-tertiary)] font-mono text-[11px] text-[var(--text-primary)] border-l-2 border-indigo-500">
            D[i,j] = min &#123;<br />
            &nbsp;&nbsp;D[i-1, j] + 1 (Del),<br />
            &nbsp;&nbsp;D[i, j-1] + 1 (Ins),<br />
            &nbsp;&nbsp;D[i-1, j-1] + cost(s1[i], s2[j])<br />
            &#125;
          </div>
          <span className="text-[10px] text-[var(--text-muted)] mt-2 block">Complexity: O(M &times; N) time &amp; space</span>
        </div>

        <div className="p-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] shadow-lg">
          <h3 className="font-bold text-base text-purple-400 mb-2">2. Peter Norvig's Bayesian Model</h3>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-3">
            Applies Bayes' theorem to find candidate word maximizing posterior probability over a noisy channel:
          </p>
          <div className="p-3 rounded-lg bg-[var(--bg-tertiary)] font-mono text-[11px] text-[var(--text-primary)] border-l-2 border-purple-500">
            c* = argmax_c [ P(w|c) &times; P(c) ]<br />
            P(c) = Count(c) / N (Language Model)<br />
            P(w|c) ~ EditDistance(w, c)
          </div>
          <span className="text-[10px] text-[var(--text-muted)] mt-2 block">Candidate set: Edits 1 &amp; Edits 2</span>
        </div>

        <div className="p-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] shadow-lg">
          <h3 className="font-bold text-base text-emerald-400 mb-2">3. Syntactic Agreement Rules</h3>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-3">
            Enforces morphological, syntactic, and phonological constraints across clauses:
          </p>
          <ul className="text-xs text-[var(--text-secondary)] space-y-1.5 list-disc pl-4">
            <li><strong>Subject-Verb:</strong> Singular 3rd-person requires -s/-es (*study &rarr; studies*).</li>
            <li><strong>Articles:</strong> Phonological vowel vs consonant sound allomorphs.</li>
            <li><strong>Polarity:</strong> Double negative normalization.</li>
          </ul>
        </div>
      </div>

      {/* Viva Voce Interactive Accordion */}
      <div className="p-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] shadow-xl">
        <h2 className="text-lg font-bold flex items-center gap-2 text-[var(--text-primary)] mb-4">
          <BookOpen className="w-5 h-5 text-indigo-400" />
          Academic Viva Voce Q&amp;A Highlights
        </h2>

        <div className="flex flex-col gap-3">
          {VIVA_QA.map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={`qa-${idx}`}
                className="border border-[var(--border-subtle)] rounded-xl overflow-hidden bg-[var(--bg-tertiary)]"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between p-4 text-left font-semibold text-xs text-[var(--text-primary)] hover:text-indigo-400 transition-colors cursor-pointer"
                >
                  <span>Q{idx + 1}: {item.q}</span>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-indigo-400" /> : <ChevronDown className="w-4 h-4 text-[var(--text-muted)]" />}
                </button>
                {isOpen && (
                  <div className="p-4 pt-0 text-xs text-[var(--text-secondary)] leading-relaxed border-t border-[var(--border-subtle)]">
                    <strong className="text-emerald-400">Answer:</strong> {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
