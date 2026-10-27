import { NLPIssue } from './types';

const BASE_TO_SINGULAR: Record<string, string> = {
  "study": "studies", "go": "goes", "do": "does", "have": "has",
  "want": "wants", "need": "needs", "see": "sees", "know": "knows",
  "make": "makes", "take": "takes", "come": "comes", "think": "thinks",
  "look": "looks", "use": "uses", "find": "finds", "give": "gives",
  "tell": "tells", "work": "works", "call": "calls", "try": "tries",
  "ask": "asks", "feel": "feels", "become": "becomes", "leave": "leaves",
  "put": "puts", "mean": "means", "keep": "keeps", "let": "lets",
  "begin": "begins", "seem": "seems", "help": "helps", "talk": "talks",
  "run": "runs", "play": "plays", "move": "moves", "like": "likes",
  "live": "lives", "believe": "believes", "write": "writes", "read": "reads"
};

const REDUNDANCIES = [
  { pattern: /\brevert back\b/gi, repl: "reply", reason: "Tautology: 'revert' already means to return or reply." },
  { pattern: /\bend result\b/gi, repl: "result", reason: "Redundant: a result is by definition at the end." },
  { pattern: /\bpast history\b/gi, repl: "history", reason: "Redundant: history by definition occurred in the past." },
  { pattern: /\bfree gift\b/gi, repl: "gift", reason: "Redundant: a gift is inherently free." },
  { pattern: /\bclose proximity\b/gi, repl: "proximity", reason: "Redundant: proximity means closeness." },
  { pattern: /\bcompletely eliminated?\b/gi, repl: "eliminated", reason: "Redundant: elimination is already absolute." }
];

const CONTRACTIONS: Record<string, string> = {
  "dont": "don't", "cant": "can't", "wont": "won't", "didnt": "didn't",
  "doesnt": "doesn't", "isnt": "isn't", "arent": "aren't", "wasnt": "wasn't",
  "werent": "weren't", "havent": "haven't", "hasnt": "hasn't", "couldnt": "couldn't",
  "shouldnt": "shouldn't", "wouldnt": "wouldn't"
};

export function checkGrammarRules(text: string): NLPIssue[] {
  const issues: NLPIssue[] = [];
  let idCounter = 1;

  // 1. Article Agreement ('a' vs 'an')
  const vowelRegex = /\b(a)\s+((?!(?:uni|use|user|uk|eu|one|once)\b)[aeiou][a-z]*|honest|hour|honor)\b/gi;
  let match: RegExpExecArray | null;
  while ((match = vowelRegex.exec(text)) !== null) {
    const art = match[1]!;
    const nextWord = match[2]!;
    const repl = art === "A" ? "An" : "an";
    issues.push({
      id: `grammar-${idCounter++}`,
      type: "GRAMMAR",
      category: "Article Agreement",
      original: `${art} ${nextWord}`,
      suggestion: `${repl} ${nextWord}`,
      explanation: `Use '${repl}' before words beginning with a vowel sound.`,
      start: match.index,
      end: match.index + match[0].length
    });
  }

  const consonantRegex = /\b(an)\s+((?!(?:hour|honest|honor)\b)(?:[bcdfghjklmnpqrstvwxyz]|uni|unique|european|useful|uniform|universal)[a-z]*)\b/gi;
  while ((match = consonantRegex.exec(text)) !== null) {
    const art = match[1]!;
    const nextWord = match[2]!;
    const repl = art === "An" ? "A" : "a";
    issues.push({
      id: `grammar-${idCounter++}`,
      type: "GRAMMAR",
      category: "Article Agreement",
      original: `${art} ${nextWord}`,
      suggestion: `${repl} ${nextWord}`,
      explanation: `Use '${repl}' before words beginning with a consonant sound.`,
      start: match.index,
      end: match.index + match[0].length
    });
  }

  // 2. Subject-Verb Agreement (Singular third person pronouns)
  const singPronouns = ["he", "she", "it"];
  for (const sp of singPronouns) {
    const regex = new RegExp(`\\b(${sp})\\s+([a-zA-Z]+)\\b`, "gi");
    while ((match = regex.exec(text)) !== null) {
      const subj = match[1]!;
      const verb = match[2]!.toLowerCase();
      if (verb === "were") {
        issues.push({
          id: `grammar-${idCounter++}`,
          type: "GRAMMAR",
          category: "Subject-Verb Agreement",
          original: match[0],
          suggestion: `${subj} was`,
          explanation: `Singular subject '${subj}' takes singular past auxiliary 'was'.`,
          start: match.index,
          end: match.index + match[0].length
        });
      } else if (verb === "have") {
        issues.push({
          id: `grammar-${idCounter++}`,
          type: "GRAMMAR",
          category: "Subject-Verb Agreement",
          original: match[0],
          suggestion: `${subj} has`,
          explanation: `Third-person singular subject '${subj}' takes 'has'.`,
          start: match.index,
          end: match.index + match[0].length
        });
      } else if (verb === "are") {
        issues.push({
          id: `grammar-${idCounter++}`,
          type: "GRAMMAR",
          category: "Subject-Verb Agreement",
          original: match[0],
          suggestion: `${subj} is`,
          explanation: `Third-person singular subject '${subj}' takes 'is'.`,
          start: match.index,
          end: match.index + match[0].length
        });
      } else if (BASE_TO_SINGULAR[verb]) {
        const singVerb = BASE_TO_SINGULAR[verb];
        issues.push({
          id: `grammar-${idCounter++}`,
          type: "GRAMMAR",
          category: "Subject-Verb Agreement",
          original: match[0],
          suggestion: `${subj} ${singVerb}`,
          explanation: `Third-person singular subject '${subj}' requires singular verb '${singVerb}'.`,
          start: match.index,
          end: match.index + match[0].length
        });
      }
    }
  }

  // 3. Subject-Verb Agreement (Noun Phrase: "The scientist study")
  const nounPhraseRegex = /\b(the\s+[a-zA-Z]+)\s+([a-zA-Z]+)\b/gi;
  while ((match = nounPhraseRegex.exec(text)) !== null) {
    const np = match[1]!;
    const noun = np.toLowerCase().split(/\s+/)[1]!;
    const verb = match[2]!.toLowerCase();
    if (!noun.endsWith("s") && BASE_TO_SINGULAR[verb]) {
      const singVerb = BASE_TO_SINGULAR[verb];
      issues.push({
        id: `grammar-${idCounter++}`,
        type: "GRAMMAR",
        category: "Subject-Verb Agreement",
        original: match[0],
        suggestion: `${np} ${singVerb}`,
        explanation: `Singular subject '${noun}' requires singular verb '${singVerb}'.`,
        start: match.index,
        end: match.index + match[0].length
      });
    }
  }

  // 4. Plural Subject Agreement ("They was", "We is")
  const plRegex = /\b(they|we|you)\s+(was|is|has)\b/gi;
  while ((match = plRegex.exec(text)) !== null) {
    const subj = match[1]!;
    const verb = match[2]!.toLowerCase();
    const repl = { "was": "were", "is": "are", "has": "have" }[verb]!;
    issues.push({
      id: `grammar-${idCounter++}`,
      type: "GRAMMAR",
      category: "Subject-Verb Agreement",
      original: match[0],
      suggestion: `${subj} ${repl}`,
      explanation: `Plural subject '${subj}' requires plural auxiliary '${repl}'.`,
      start: match.index,
      end: match.index + match[0].length
    });
  }

  // 5. Double Negatives
  const dnRegex = /\b(don't|dont|didn't|didnt|can't|cant|won't|wont)\s+(?:[a-z]+\s+)?(no|nothing|nobody|nowhere)\b/gi;
  const dnMap: Record<string, string> = { "no": "any", "nothing": "anything", "nobody": "anybody", "nowhere": "anywhere" };
  while ((match = dnRegex.exec(text)) !== null) {
    const bad = match[2]!.toLowerCase();
    const repl = dnMap[bad] ?? "any";
    issues.push({
      id: `grammar-${idCounter++}`,
      type: "GRAMMAR",
      category: "Double Negative",
      original: match[0],
      suggestion: `${match[1]} ${repl}`,
      explanation: `Avoid double negatives in formal English; use '${repl}' instead of '${bad}'.`,
      start: match.index,
      end: match.index + match[0].length
    });
  }

  // 6. Duplicate Words ("is is", "the the")
  const dupRegex = /\b([a-zA-Z]+)\s+\1\b/gi;
  while ((match = dupRegex.exec(text)) !== null) {
    const word = match[1]!;
    if (!["had", "that"].includes(word.toLowerCase())) {
      issues.push({
        id: `grammar-${idCounter++}`,
        type: "GRAMMAR",
        category: "Repeated Word",
        original: match[0],
        suggestion: word,
        explanation: `Duplicate consecutive word '${word}'.`,
        start: match.index,
        end: match.index + match[0].length
      });
    }
  }

  // 7. Redundancies
  for (const red of REDUNDANCIES) {
    let rMatch: RegExpExecArray | null;
    while ((rMatch = red.pattern.exec(text)) !== null) {
      issues.push({
        id: `style-${idCounter++}`,
        type: "STYLE",
        category: "Redundancy",
        original: rMatch[0],
        suggestion: red.repl,
        explanation: red.reason,
        start: rMatch.index,
        end: rMatch.index + rMatch[0].length
      });
    }
  }

  // 8. Contractions without apostrophe
  for (const [bad, good] of Object.entries(CONTRACTIONS)) {
    const cRegex = new RegExp(`\\b${bad}\\b`, "gi");
    let cMatch: RegExpExecArray | null;
    while ((cMatch = cRegex.exec(text)) !== null) {
      const val = cMatch[0];
      const formatted = val[0] === val[0]?.toUpperCase() ? good.charAt(0).toUpperCase() + good.slice(1) : good;
      issues.push({
        id: `spelling-${idCounter++}`,
        type: "SPELLING",
        category: "Missing Apostrophe",
        original: val,
        suggestion: formatted,
        explanation: `Add apostrophe to contraction: '${formatted}'.`,
        start: cMatch.index,
        end: cMatch.index + cMatch[0].length
      });
    }
  }

  // 9. Capitalization after sentence terminator
  const capRegex = /(?:^|[.?!]\s+)([a-z])/g;
  while ((match = capRegex.exec(text)) !== null) {
    const char = match[1]!;
    const charIndex = match.index + match[0].length - 1;
    issues.push({
      id: `grammar-${idCounter++}`,
      type: "GRAMMAR",
      category: "Capitalization",
      original: char,
      suggestion: char.toUpperCase(),
      explanation: "Capitalize the first letter of a sentence.",
      start: charIndex,
      end: charIndex + 1
    });
  }

  return issues;
}
