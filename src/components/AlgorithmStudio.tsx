import React, { useState } from 'react';
import { computeLevenshtein } from '../lib/nlp/editDistance';
import { getNorvigCandidates } from '../lib/nlp/norvigSpell';
import { tagPartsOfSpeech } from '../lib/nlp/nlpEngine';
import { DPOperation } from '../lib/nlp/types';
import { LayoutGrid, Binary, Layers } from 'lucide-react';

interface AlgorithmStudioProps {
  initialSource?: string;
  initialTarget?: string;
}

export const AlgorithmStudio: React.FC<AlgorithmStudioProps> = ({
  initialSource = "recieve",
  initialTarget = "receive"
}) => {
  // DP Matrix States
  const [source, setSource] = useState(initialSource);
  const [target, setTarget] = useState(initialTarget);
  const [matrixResult, setMatrixResult] = useState(() => computeLevenshtein(initialSource, initialTarget));

  // Norvig States
  const [norvigWord, setNorvigWord] = useState("definately");
  const [candidates, setCandidates] = useState(() => getNorvigCandidates("definately"));

  // POS States
  const [posSentence, setPosSentence] = useState("The scientist study the chemical reaction carefully.");
  const [posTokens, setPosTokens] = useState(() => tagPartsOfSpeech("The scientist study the chemical reaction carefully."));

  const handleComputeMatrix = () => {
    if (!source || !target) return;
    setMatrixResult(computeLevenshtein(source.trim(), target.trim()));
  };

  const handleInspectNorvig = () => {
    if (!norvigWord) return;
    setCandidates(getNorvigCandidates(norvigWord.trim()));
  };

  const handleInspectPOS = () => {
    if (!posSentence) return;
    setPosTokens(tagPartsOfSpeech(posSentence.trim()));
  };

  // Compute coordinate set for optimal backtrace cells
  const pathCoords = new Set<string>();
  let curI = 0;
  let curJ = 0;
  pathCoords.add(`0,0`);
  for (const op of matrixResult.operations) {
    if (op.type === "MATCH" || op.type === "SUBSTITUTE") {
      curI++;
      curJ++;
    } else if (op.type === "DELETE") {
      curI++;
    } else if (op.type === "INSERT") {
      curJ++;
    }
    pathCoords.add(`${curI},${curJ}`);
  }

  const maxFreq = Math.max(...candidates.map(c => c.frequency), 1);

  return (
    <div className="flex flex-col gap-8 mt-4">
      {/* 1. Levenshtein Dynamic Programming Matrix Visualizer */}
      <div className="p-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] shadow-xl">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-indigo-500/15 text-indigo-400">
            <LayoutGrid className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[var(--text-primary)]">
              Levenshtein Distance Dynamic Programming Matrix
            </h2>
            <p className="text-xs text-[var(--text-secondary)]">
              Interactive 2D sequence alignment table D[i, j]. Emerald cells highlight the optimal backtrace alignment path.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 my-5">
          <input
            type="text"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            placeholder="Source word (e.g. recieve)"
            className="flex-1 min-w-[200px] px-3.5 py-2 text-sm rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-tertiary)] text-[var(--text-primary)] outline-none focus:border-indigo-500 font-mono"
          />
          <input
            type="text"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            placeholder="Target word (e.g. receive)"
            className="flex-1 min-w-[200px] px-3.5 py-2 text-sm rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-tertiary)] text-[var(--text-primary)] outline-none focus:border-indigo-500 font-mono"
          />
          <button
            onClick={handleComputeMatrix}
            className="px-5 py-2 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-md transition-all cursor-pointer"
          >
            Compute Alignment Matrix
          </button>
        </div>

        <div className="flex flex-wrap gap-3 mb-4 text-xs text-[var(--text-secondary)]">
          <span className="px-3 py-1 rounded-md border border-[var(--border-subtle)] bg-[var(--bg-tertiary)]">
            Levenshtein Distance: <strong className="text-indigo-400 font-mono text-sm">{matrixResult.distance}</strong>
          </span>
          <span className="px-3 py-1 rounded-md border border-[var(--border-subtle)] bg-[var(--bg-tertiary)]">
            Source: <em className="text-[var(--text-primary)] font-mono">"{source}"</em> ({source.length} chars)
          </span>
          <span className="px-3 py-1 rounded-md border border-[var(--border-subtle)] bg-[var(--bg-tertiary)]">
            Target: <em className="text-[var(--text-primary)] font-mono">"{target}"</em> ({target.length} chars)
          </span>
        </div>

        {/* 2D DP Table */}
        <div className="overflow-x-auto rounded-xl border border-[var(--border-subtle)] mb-6">
          <table className="w-full border-collapse font-mono text-sm text-center bg-[var(--bg-tertiary)]">
            <thead>
              <tr className="bg-[var(--bg-secondary)] text-indigo-400 font-bold">
                <th className="p-2.5 border border-[var(--border-subtle)] text-xs text-[var(--text-muted)]">D[i,j]</th>
                <th className="p-2.5 border border-[var(--border-subtle)]">#</th>
                {target.split('').map((char, idx) => (
                  <th key={`col-${idx}`} className="p-2.5 border border-[var(--border-subtle)]">{char}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {matrixResult.matrix.map((row, i) => (
                <tr key={`row-${i}`}>
                  <th className="p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-secondary)] text-indigo-400 font-bold">
                    {i === 0 ? '#' : source[i - 1]}
                  </th>
                  {row.map((val, j) => {
                    const isPath = pathCoords.has(`${i},${j}`);
                    return (
                      <td
                        key={`cell-${i}-${j}`}
                        title={`D[${i},${j}] = ${val}`}
                        className={`p-2.5 border border-[var(--border-subtle)] transition-colors ${
                          isPath
                            ? 'bg-emerald-500/20 text-emerald-400 font-bold shadow-inner'
                            : 'text-[var(--text-secondary)] hover:bg-indigo-500/10'
                        }`}
                      >
                        {val}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Optimal Path Operations */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2">
            Optimal Backtraced Alignment Operations
          </h4>
          <div className="flex flex-wrap gap-2">
            {matrixResult.operations.map((op: DPOperation, idx: number) => {
              let chipStyle = "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
              let label = `Match '${op.sourceChar}'`;
              if (op.type === "SUBSTITUTE") {
                chipStyle = "bg-purple-500/15 text-purple-400 border-purple-500/30";
                label = `Sub '${op.sourceChar}' → '${op.targetChar}'`;
              } else if (op.type === "DELETE") {
                chipStyle = "bg-rose-500/15 text-rose-400 border-rose-500/30";
                label = `Del '${op.sourceChar}'`;
              } else if (op.type === "INSERT") {
                chipStyle = "bg-cyan-500/15 text-cyan-400 border-cyan-500/30";
                label = `Ins '${op.targetChar}'`;
              }
              return (
                <span
                  key={`op-${idx}`}
                  className={`px-2.5 py-1 text-xs font-mono font-semibold rounded-md border ${chipStyle}`}
                >
                  Step {idx + 1}: {label}
                </span>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. Peter Norvig's Bayesian Candidate Generator */}
      <div className="p-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] shadow-xl">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-purple-500/15 text-purple-400">
            <Binary className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[var(--text-primary)]">
              Peter Norvig Bayesian Candidate Generator & Prior Probabilities
            </h2>
            <p className="text-xs text-[var(--text-secondary)]">
              Generates candidate words up to edit distance 2 and ranks by prior probability P(c) = Count(c) / N.
            </p>
          </div>
        </div>

        <div className="flex gap-3 my-5">
          <input
            type="text"
            value={norvigWord}
            onChange={(e) => setNorvigWord(e.target.value)}
            placeholder="Enter typo word (e.g. definately)"
            className="flex-1 px-3.5 py-2 text-sm rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-tertiary)] text-[var(--text-primary)] outline-none focus:border-indigo-500 font-mono"
          />
          <button
            onClick={handleInspectNorvig}
            className="px-5 py-2 text-xs font-bold rounded-lg bg-purple-600 hover:bg-purple-500 text-white shadow-md transition-all cursor-pointer"
          >
            Generate & Rank Candidates
          </button>
        </div>

        <div className="flex flex-col gap-3">
          {candidates.length === 0 ? (
            <p className="text-xs text-[var(--text-muted)] italic">No candidates found within distance 2.</p>
          ) : (
            candidates.map((cand, idx) => {
              const pct = Math.min(100, Math.round((cand.frequency / maxFreq) * 100));
              return (
                <div key={cand.word} className="p-3.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-tertiary)]">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-purple-400 font-mono">#{idx + 1}</span>
                      <strong className="text-sm font-semibold text-[var(--text-primary)]">{cand.word}</strong>
                      <span className="text-[var(--text-muted)]">Edit Distance: {cand.editDistance}</span>
                    </div>
                    <span className="text-[var(--text-secondary)] font-mono">
                      Corpus Freq: {cand.frequency.toLocaleString()} | P(c): {cand.priorProbability.toExponential(3)}
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[var(--border-subtle)] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 3. POS Tagger Visualizer */}
      <div className="p-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] shadow-xl">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-cyan-500/15 text-cyan-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[var(--text-primary)]">
              Part-of-Speech (POS) Syntactic Tagger
            </h2>
            <p className="text-xs text-[var(--text-secondary)]">
              Tags grammatical tokens to support syntactic agreement checking.
            </p>
          </div>
        </div>

        <div className="flex gap-3 my-5">
          <input
            type="text"
            value={posSentence}
            onChange={(e) => setPosSentence(e.target.value)}
            placeholder="Enter sentence..."
            className="flex-1 px-3.5 py-2 text-sm rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-tertiary)] text-[var(--text-primary)] outline-none focus:border-indigo-500"
          />
          <button
            onClick={handleInspectPOS}
            className="px-5 py-2 text-xs font-bold rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white shadow-md transition-all cursor-pointer"
          >
            Inspect POS
          </button>
        </div>

        <div className="flex flex-wrap gap-3 p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-tertiary)]">
          {posTokens.map((item, idx) => {
            let color = "bg-blue-500/15 text-blue-400 border-blue-500/30";
            if (item.tag === "VERB") color = "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
            else if (item.tag === "ADJECTIVE") color = "bg-purple-500/15 text-purple-400 border-purple-500/30";
            else if (item.tag === "ADVERB") color = "bg-amber-500/15 text-amber-400 border-amber-500/30";
            else if (item.tag === "PRONOUN") color = "bg-pink-500/15 text-pink-400 border-pink-500/30";
            else if (item.tag === "PREPOSITION") color = "bg-cyan-500/15 text-cyan-400 border-cyan-500/30";
            else if (item.tag === "DETERMINER") color = "bg-slate-500/15 text-slate-400 border-slate-500/30";

            return (
              <div key={`pos-${idx}`} className={`flex flex-col items-center px-3 py-1.5 rounded-lg border ${color}`}>
                <span className="font-semibold text-sm text-[var(--text-primary)]">{item.token}</span>
                <span className="text-[10px] font-bold uppercase tracking-wider mt-0.5">{item.tag}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
