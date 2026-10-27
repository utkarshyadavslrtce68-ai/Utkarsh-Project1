import { NLPIssue, NLPAnalysisResult, POSToken } from './types';
import { isWordKnown } from './dictionary';
import { computeLevenshtein } from './editDistance';
import { getNorvigCandidates } from './norvigSpell';
import { checkGrammarRules } from './grammarChecker';
import { checkConfusionSets } from './confusionSets';
import { computeReadability } from './readability';

export function analyzeText(text: string): NLPAnalysisResult {
  if (!text || !text.trim()) {
    return {
      issues: [],
      metrics: computeReadability(""),
      correctedText: ""
    };
  }

  const issues: NLPIssue[] = [];
  const coveredSpans = new Set<number>();
  let idCounter = 1;

  // 1. Syntactic Grammar Checks
  const grammarIssues = checkGrammarRules(text);
  for (const g of grammarIssues) {
    issues.push(g);
    for (let pos = g.start; pos < g.end; pos++) coveredSpans.add(pos);
  }

  // 2. Real-Word Confusion Sets
  const confIssues = checkConfusionSets(text);
  for (const c of confIssues) {
    let overlaps = false;
    for (let pos = c.start; pos < c.end; pos++) {
      if (coveredSpans.has(pos)) { overlaps = true; break; }
    }
    if (!overlaps) {
      issues.push(c);
      for (let pos = c.start; pos < c.end; pos++) coveredSpans.add(pos);
    }
  }

  // 3. Isolated Non-Word Spelling Checks
  const wordRegex = /\b[a-zA-Z]+(?:'[a-zA-Z]+)?\b/g;
  let wMatch: RegExpExecArray | null;
  while ((wMatch = wordRegex.exec(text)) !== null) {
    const word = wMatch[0];
    const start = wMatch.index;
    const end = start + word.length;

    let isCovered = false;
    for (let pos = start; pos < end; pos++) {
      if (coveredSpans.has(pos)) { isCovered = true; break; }
    }
    if (isCovered) continue;

    // Skip single letter words like 'a', 'I'
    if (word.length === 1 && ["a", "i"].includes(word.toLowerCase())) continue;

    if (!isWordKnown(word)) {
      const cands = getNorvigCandidates(word);
      if (cands.length > 0 && cands[0]) {
        let best = cands[0].word;
        if (word === word.toUpperCase()) best = best.toUpperCase();
        else if (word[0] === word[0]?.toUpperCase()) best = best.charAt(0).toUpperCase() + best.slice(1);

        const { distance } = computeLevenshtein(word, best);
        issues.push({
          id: `spelling-${idCounter++}`,
          type: "SPELLING",
          category: "Non-Word Typo",
          original: word,
          suggestion: best,
          candidates: cands.map(c => c.word),
          editDistance: distance,
          explanation: `Misspelled word '${word}'. Suggested correction: '${best}' (Levenshtein distance: ${distance}).`,
          start,
          end
        });
        for (let pos = start; pos < end; pos++) coveredSpans.add(pos);
      }
    }
  }

  // Sort issues by start position
  issues.sort((a, b) => a.start - b.start);

  const metrics = computeReadability(text);
  const correctedText = buildCorrectedText(text, issues);

  return {
    issues,
    metrics,
    correctedText
  };
}

export function buildCorrectedText(text: string, issues: NLPIssue[]): string {
  const sorted = [...issues].sort((a, b) => b.start - a.start);
  const chars = text.split("");
  for (const issue of sorted) {
    if (issue.suggestion && issue.suggestion !== "Consider active voice") {
      chars.splice(issue.start, issue.end - issue.start, issue.suggestion);
    }
  }
  return chars.join("");
}

export function tagPartsOfSpeech(sentence: string): POSToken[] {
  const tokens = sentence.match(/\b[a-zA-Z]+(?:'[a-zA-Z]+)?\b/g) || [];
  const tagged: POSToken[] = [];

  const determiners = new Set(["the", "a", "an", "this", "that", "these", "those", "my", "your", "his", "her", "its", "our", "their"]);
  const prepositions = new Set(["in", "on", "at", "to", "for", "with", "from", "by", "about", "into", "through", "during", "before", "after", "above", "below", "between", "under"]);
  const pronouns = new Set(["i", "you", "he", "she", "it", "we", "they", "me", "him", "her", "us", "them", "who", "whom", "what", "which"]);
  const conjunctions = new Set(["and", "but", "or", "nor", "for", "yet", "so", "because", "although", "since", "unless", "while"]);

  for (let i = 0; i < tokens.length; i++) {
    const w = tokens[i]!;
    const lower = w.toLowerCase();
    let tag: POSToken['tag'] = 'NOUN';

    if (determiners.has(lower)) tag = 'DETERMINER';
    else if (prepositions.has(lower)) tag = 'PREPOSITION';
    else if (pronouns.has(lower)) tag = 'PRONOUN';
    else if (conjunctions.has(lower)) tag = 'CONJUNCTION';
    else if (lower.endsWith('ly')) tag = 'ADVERB';
    else if (lower.endsWith('able') || lower.endsWith('ous') || lower.endsWith('ive') || lower.endsWith('ful') || lower.endsWith('ic')) tag = 'ADJECTIVE';
    else if (lower.endsWith('ing') || lower.endsWith('ed') || ["is", "are", "was", "were", "be", "been", "have", "has", "do", "does", "did", "study", "studies", "go", "goes"].includes(lower)) tag = 'VERB';
    else if (i > 0 && determiners.has(tokens[i - 1]!.toLowerCase())) tag = 'NOUN';

    tagged.push({ token: w, tag });
  }

  return tagged;
}
