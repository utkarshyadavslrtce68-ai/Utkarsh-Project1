import { isWordKnown, getWordFrequency, TOTAL_CORPUS_WORDS } from './dictionary';
import { NorvigCandidate } from './types';

const LETTERS = "abcdefghijklmnopqrstuvwxyz";

/**
 * Generates all edits that are 1 edit distance away from the word.
 */
export function edits1(word: string): Set<string> {
  const edits = new Set<string>();
  const w = word.toLowerCase();
  const n = w.length;

  // Deletions
  for (let i = 0; i < n; i++) {
    edits.add(w.slice(0, i) + w.slice(i + 1));
  }

  // Transpositions
  for (let i = 0; i < n - 1; i++) {
    edits.add(w.slice(0, i) + w[i + 1] + w[i] + w.slice(i + 2));
  }

  // Replacements
  for (let i = 0; i < n; i++) {
    for (const c of LETTERS) {
      edits.add(w.slice(0, i) + c + w.slice(i + 1));
    }
  }

  // Insertions
  for (let i = 0; i <= n; i++) {
    for (const c of LETTERS) {
      edits.add(w.slice(0, i) + c + w.slice(i));
    }
  }

  return edits;
}

/**
 * Generates candidate spelling corrections ranked by edit distance and prior probability P(c).
 */
export function getNorvigCandidates(word: string): NorvigCandidate[] {
  const w = word.toLowerCase();
  if (isWordKnown(w)) {
    const freq = getWordFrequency(w);
    return [{
      word: w,
      editDistance: 0,
      frequency: freq,
      priorProbability: freq / TOTAL_CORPUS_WORDS
    }];
  }

  // Edit distance 1
  const e1 = edits1(w);
  const known1: NorvigCandidate[] = [];
  for (const cand of e1) {
    if (isWordKnown(cand)) {
      const freq = getWordFrequency(cand);
      known1.push({
        word: cand,
        editDistance: 1,
        frequency: freq,
        priorProbability: freq / TOTAL_CORPUS_WORDS
      });
    }
  }

  if (known1.length > 0) {
    known1.sort((a, b) => b.frequency - a.frequency);
    return known1.slice(0, 5);
  }

  // Edit distance 2 (sample top)
  const known2: NorvigCandidate[] = [];
  let count = 0;
  for (const cand1 of e1) {
    if (count++ > 40) break;
    const e2 = edits1(cand1);
    for (const cand2 of e2) {
      if (isWordKnown(cand2)) {
        if (!known2.some(x => x.word === cand2)) {
          const freq = getWordFrequency(cand2);
          known2.push({
            word: cand2,
            editDistance: 2,
            frequency: freq,
            priorProbability: freq / TOTAL_CORPUS_WORDS
          });
        }
      }
    }
  }

  if (known2.length > 0) {
    known2.sort((a, b) => b.frequency - a.frequency);
    return known2.slice(0, 5);
  }

  return [];
}
