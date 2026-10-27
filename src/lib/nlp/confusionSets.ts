import { NLPIssue } from './types';

interface TokenPos {
  word: string;
  start: number;
  end: number;
}

export function checkConfusionSets(text: string): NLPIssue[] {
  const issues: NLPIssue[] = [];
  const tokens: TokenPos[] = [];
  const tokenRegex = /\b[a-zA-Z']+\b/g;
  let m: RegExpExecArray | null;

  while ((m = tokenRegex.exec(text)) !== null) {
    tokens.push({ word: m[0], start: m.index, end: m.index + m[0].length });
  }

  let idCounter = 1;

  for (let i = 0; i < tokens.length; i++) {
    const cur = tokens[i]!;
    const wLower = cur.word.toLowerCase();
    const nextWord = i + 1 < tokens.length ? tokens[i + 1]!.word.toLowerCase() : "";
    const prevWord = i > 0 ? tokens[i - 1]!.word.toLowerCase() : "";

    // 1. Their / There / They're
    if (wLower === "their" && ["going", "coming", "doing", "waiting", "planning", "not", "always", "very"].includes(nextWord)) {
      issues.push({
        id: `confusion-${idCounter++}`,
        type: "CONFUSION_SET",
        category: "Context-Sensitive Spelling",
        original: cur.word,
        suggestion: cur.word[0] === cur.word[0]?.toUpperCase() ? "They're" : "they're",
        explanation: "Use contraction 'they're' ('they are') before a verb/participle.",
        start: cur.start,
        end: cur.end
      });
    } else if (wLower === "their" && ["is", "are", "was", "were", "will", "has", "have", "exists"].includes(nextWord)) {
      issues.push({
        id: `confusion-${idCounter++}`,
        type: "CONFUSION_SET",
        category: "Context-Sensitive Spelling",
        original: cur.word,
        suggestion: cur.word[0] === cur.word[0]?.toUpperCase() ? "There" : "there",
        explanation: "'There' indicates existential state ('there is/are') or a physical location.",
        start: cur.start,
        end: cur.end
      });
    } else if (["there", "they're"].includes(wLower) && ["car", "house", "turn", "decision", "dog", "work", "parents", "team", "project"].includes(nextWord)) {
      issues.push({
        id: `confusion-${idCounter++}`,
        type: "CONFUSION_SET",
        category: "Context-Sensitive Spelling",
        original: cur.word,
        suggestion: cur.word[0] === cur.word[0]?.toUpperCase() ? "Their" : "their",
        explanation: "'Their' is possessive, indicating ownership before a noun.",
        start: cur.start,
        end: cur.end
      });
    }

    // 2. Its / It's
    if (wLower === "its" && ["a", "an", "the", "not", "been", "time", "clear", "hard", "easy", "raining"].includes(nextWord)) {
      issues.push({
        id: `confusion-${idCounter++}`,
        type: "CONFUSION_SET",
        category: "Context-Sensitive Spelling",
        original: cur.word,
        suggestion: cur.word[0] === cur.word[0]?.toUpperCase() ? "It's" : "it's",
        explanation: "'It's' is the contraction for 'it is' or 'it has'.",
        start: cur.start,
        end: cur.end
      });
    } else if (wLower === "it's" && ["color", "tail", "name", "size", "engine", "purpose", "value", "speed", "own"].includes(nextWord)) {
      issues.push({
        id: `confusion-${idCounter++}`,
        type: "CONFUSION_SET",
        category: "Context-Sensitive Spelling",
        original: cur.word,
        suggestion: cur.word[0] === cur.word[0]?.toUpperCase() ? "Its" : "its",
        explanation: "'Its' is the possessive pronoun without an apostrophe.",
        start: cur.start,
        end: cur.end
      });
    }

    // 3. Then / Than
    if (wLower === "then" && ["more", "less", "better", "worse", "greater", "higher", "lower", "rather"].includes(prevWord)) {
      issues.push({
        id: `confusion-${idCounter++}`,
        type: "CONFUSION_SET",
        category: "Context-Sensitive Spelling",
        original: cur.word,
        suggestion: "than",
        explanation: "'Than' is used for comparisons after comparative adjectives.",
        start: cur.start,
        end: cur.end
      });
    }

    // 4. Loose / Lose
    if (wLower === "loose" && ["to", "will", "might", "can", "don't", "dont", "did"].includes(prevWord)) {
      issues.push({
        id: `confusion-${idCounter++}`,
        type: "CONFUSION_SET",
        category: "Context-Sensitive Spelling",
        original: cur.word,
        suggestion: "lose",
        explanation: "'Lose' is the verb meaning to misplace or suffer defeat.",
        start: cur.start,
        end: cur.end
      });
    }
  }

  return issues;
}
