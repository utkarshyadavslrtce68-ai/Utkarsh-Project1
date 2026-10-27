/**
 * LexiCheck NLP Engine
 * Client-Side Computational Linguistics and Rule-Based Engine
 */

class NLPEngine {
  constructor() {
    this.letters = "abcdefghijklmnopqrstuvwxyz";
    this.baseToSingular = {
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

    this.redundancies = [
      { pattern: /\brevert back\b/gi, repl: "reply", reason: "Tautology: 'revert' already means to return or reply." },
      { pattern: /\bend result\b/gi, repl: "result", reason: "Redundant: a result is already at the end." },
      { pattern: /\bpast history\b/gi, repl: "history", reason: "Redundant: history is always in the past." },
      { pattern: /\bfree gift\b/gi, repl: "gift", reason: "Redundant: a gift is inherently free." },
      { pattern: /\bclose proximity\b/gi, repl: "proximity", reason: "Redundant: proximity means closeness." },
      { pattern: /\bcompletely eliminated?\b/gi, repl: "eliminated", reason: "Redundant: elimination is absolute." }
    ];

    this.contractions = {
      "dont": "don't", "cant": "can't", "wont": "won't", "didnt": "didn't",
      "doesnt": "doesn't", "isnt": "isn't", "arent": "aren't", "wasnt": "wasn't",
      "werent": "weren't", "havent": "haven't", "hasnt": "hasn't", "couldnt": "couldn't",
      "shouldnt": "shouldn't", "wouldnt": "wouldn't"
    };
  }

  // ==========================================
  // 1. LEVENSHTEIN DYNAMIC PROGRAMMING MATRIX
  // ==========================================
  computeLevenshteinMatrix(source, target) {
    const m = source.length;
    const n = target.length;
    const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        const cost = source[i - 1].toLowerCase() === target[j - 1].toLowerCase() ? 0 : 1;
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,       // Deletion
          dp[i][j - 1] + 1,       // Insertion
          dp[i - 1][j - 1] + cost // Substitution
        );
      }
    }

    const operations = this.backtrackAlignment(source, target, dp);
    return {
      distance: dp[m][n],
      matrix: dp,
      operations: operations
    };
  }

  backtrackAlignment(source, target, dp) {
    let i = source.length;
    let j = target.length;
    const ops = [];

    while (i > 0 || j > 0) {
      const current = dp[i][j];

      // Diagonal (Match or Substitution)
      if (i > 0 && j > 0) {
        const sChar = source[i - 1];
        const tChar = target[j - 1];
        const match = sChar.toLowerCase() === tChar.toLowerCase();
        const cost = match ? 0 : 1;

        if (current === dp[i - 1][j - 1] + cost) {
          ops.push({
            type: match ? "MATCH" : "SUBSTITUTE",
            sourceChar: sChar,
            targetChar: tChar,
            i: i - 1,
            j: j - 1
          });
          i--;
          j--;
          continue;
        }
      }

      // Deletion (up)
      if (i > 0 && current === dp[i - 1][j] + 1) {
        ops.push({
          type: "DELETE",
          sourceChar: source[i - 1],
          targetChar: "",
          i: i - 1,
          j: j
        });
        i--;
        continue;
      }

      // Insertion (left)
      if (j > 0 && current === dp[i][j - 1] + 1) {
        ops.push({
          type: "INSERT",
          sourceChar: "",
          targetChar: target[j - 1],
          i: i,
          j: j - 1
        });
        j--;
        continue;
      }
    }

    return ops.reverse();
  }

  // ==========================================
  // 2. PETER NORVIG'S BAYESIAN SPELLING
  // ==========================================
  edits1(word) {
    const edits = new Set();
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
      for (const c of this.letters) {
        edits.add(w.slice(0, i) + c + w.slice(i + 1));
      }
    }

    // Insertions
    for (let i = 0; i <= n; i++) {
      for (const c of this.letters) {
        edits.add(w.slice(0, i) + c + w.slice(i));
      }
    }

    return edits;
  }

  getSpellingCandidates(word) {
    const w = word.toLowerCase();
    if (LexiconData.isKnown(w)) {
      return [{ word: w, editDistance: 0, frequency: LexiconData.getFrequency(w) }];
    }

    // Edits distance 1
    const e1 = this.edits1(w);
    const known1 = [];
    for (const cand of e1) {
      if (LexiconData.isKnown(cand)) {
        known1.push({ word: cand, editDistance: 1, frequency: LexiconData.getFrequency(cand) });
      }
    }

    if (known1.length > 0) {
      known1.sort((a, b) => b.frequency - a.frequency);
      return known1.slice(0, 5);
    }

    // Edits distance 2 (sample top)
    const known2 = [];
    // To keep performance snappy in browser, examine a subset of edits1
    let count = 0;
    for (const cand1 of e1) {
      if (count++ > 40) break;
      const e2 = this.edits1(cand1);
      for (const cand2 of e2) {
        if (LexiconData.isKnown(cand2)) {
          if (!known2.some(x => x.word === cand2)) {
            known2.push({ word: cand2, editDistance: 2, frequency: LexiconData.getFrequency(cand2) });
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

  // ==========================================
  // 3. SYNTACTIC & GRAMMAR RULE ENGINE
  // ==========================================
  checkGrammar(text) {
    const issues = [];

    // A. Article Agreement ('a' vs 'an')
    const vowelRegex = /\b(a)\s+((?!(?:uni|use|user|uk|eu|one|once)\b)[aeiou][a-z]*|honest|hour|honor)\b/gi;
    let match;
    while ((match = vowelRegex.exec(text)) !== null) {
      const art = match[1];
      const repl = art === "A" ? "An" : "an";
      issues.push({
        type: "GRAMMAR",
        category: "Article Agreement",
        original: `${match[1]} ${match[2]}`,
        suggestion: `${repl} ${match[2]}`,
        explanation: `Use '${repl}' before words beginning with a vowel sound.`,
        start: match.index,
        end: match.index + match[0].length
      });
    }

    const consonantRegex = /\b(an)\s+((?!(?:hour|honest|honor)\b)(?:[bcdfghjklmnpqrstvwxyz]|uni|unique|european|useful|uniform|universal)[a-z]*)\b/gi;
    while ((match = consonantRegex.exec(text)) !== null) {
      const art = match[1];
      const repl = art === "An" ? "A" : "a";
      issues.push({
        type: "GRAMMAR",
        category: "Article Agreement",
        original: `${match[1]} ${match[2]}`,
        suggestion: `${repl} ${match[2]}`,
        explanation: `Use '${repl}' before words beginning with a consonant sound.`,
        start: match.index,
        end: match.index + match[0].length
      });
    }

    // B. Subject-Verb Agreement (Singular third person)
    const singPronouns = ["he", "she", "it"];
    for (const sp of singPronouns) {
      const regex = new RegExp(`\\b(${sp})\\s+([a-zA-Z]+)\\b`, "gi");
      while ((match = regex.exec(text)) !== null) {
        const verb = match[2].toLowerCase();
        if (verb === "were") {
          issues.push({
            type: "GRAMMAR",
            category: "Subject-Verb Agreement",
            original: match[0],
            suggestion: `${match[1]} was`,
            explanation: `Singular subject '${match[1]}' takes singular past auxiliary 'was'.`,
            start: match.index,
            end: match.index + match[0].length
          });
        } else if (verb === "have") {
          issues.push({
            type: "GRAMMAR",
            category: "Subject-Verb Agreement",
            original: match[0],
            suggestion: `${match[1]} has`,
            explanation: `Third-person singular subject '${match[1]}' takes 'has'.`,
            start: match.index,
            end: match.index + match[0].length
          });
        } else if (verb === "are") {
          issues.push({
            type: "GRAMMAR",
            category: "Subject-Verb Agreement",
            original: match[0],
            suggestion: `${match[1]} is`,
            explanation: `Third-person singular subject '${match[1]}' takes 'is'.`,
            start: match.index,
            end: match.index + match[0].length
          });
        } else if (this.baseToSingular[verb]) {
          const singVerb = this.baseToSingular[verb];
          issues.push({
            type: "GRAMMAR",
            category: "Subject-Verb Agreement",
            original: match[0],
            suggestion: `${match[1]} ${singVerb}`,
            explanation: `Third-person singular subject '${match[1]}' requires singular verb '${singVerb}'.`,
            start: match.index,
            end: match.index + match[0].length
          });
        }
      }
    }

    // C. Subject-Verb Agreement (Singular Noun Phrase: "The scientist study")
    const nounPhraseRegex = /\b(the\s+[a-zA-Z]+)\s+([a-zA-Z]+)\b/gi;
    while ((match = nounPhraseRegex.exec(text)) !== null) {
      const noun = match[1].toLowerCase().split(/\s+/)[1];
      const verb = match[2].toLowerCase();
      if (!noun.endsWith("s") && this.baseToSingular[verb]) {
        const singVerb = this.baseToSingular[verb];
        issues.push({
          type: "GRAMMAR",
          category: "Subject-Verb Agreement",
          original: match[0],
          suggestion: `${match[1]} ${singVerb}`,
          explanation: `Singular subject '${noun}' requires singular verb '${singVerb}'.`,
          start: match.index,
          end: match.index + match[0].length
        });
      }
    }

    // D. Plural Subject Agreement ("They was", "We is")
    const plRegex = /\b(they|we|you)\s+(was|is|has)\b/gi;
    while ((match = plRegex.exec(text)) !== null) {
      const subj = match[1];
      const verb = match[2].toLowerCase();
      const repl = { "was": "were", "is": "are", "has": "have" }[verb];
      issues.push({
        type: "GRAMMAR",
        category: "Subject-Verb Agreement",
        original: match[0],
        suggestion: `${subj} ${repl}`,
        explanation: `Plural subject '${subj}' requires plural auxiliary '${repl}'.`,
        start: match.index,
        end: match.index + match[0].length
      });
    }

    // E. Double Negatives
    const dnRegex = /\b(don't|dont|didn't|didnt|can't|cant|won't|wont)\s+(?:[a-z]+\s+)?(no|nothing|nobody|nowhere)\b/gi;
    const dnMap = { "no": "any", "nothing": "anything", "nobody": "anybody", "nowhere": "anywhere" };
    while ((match = dnRegex.exec(text)) !== null) {
      const bad = match[2].toLowerCase();
      const repl = dnMap[bad] || "any";
      issues.push({
        type: "GRAMMAR",
        category: "Double Negative",
        original: match[0],
        suggestion: `${match[1]} ${repl}`,
        explanation: `Avoid double negatives in formal English; use '${repl}' instead of '${bad}'.`,
        start: match.index,
        end: match.index + match[0].length
      });
    }

    // F. Duplicate Words ("is is", "the the")
    const dupRegex = /\b([a-zA-Z]+)\s+\1\b/gi;
    while ((match = dupRegex.exec(text)) !== null) {
      const word = match[1];
      if (!["had", "that"].includes(word.toLowerCase())) {
        issues.push({
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

    // G. Redundancies
    for (const red of this.redundancies) {
      let rMatch;
      while ((rMatch = red.pattern.exec(text)) !== null) {
        issues.push({
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

    // H. Contractions without apostrophe
    for (const [bad, good] of Object.entries(this.contractions)) {
      const cRegex = new RegExp(`\\b${bad}\\b`, "gi");
      let cMatch;
      while ((cMatch = cRegex.exec(text)) !== null) {
        const val = cMatch[0];
        const formatted = val[0] === val[0].toUpperCase() ? good.charAt(0).toUpperCase() + good.slice(1) : good;
        issues.push({
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

    // I. Capitalization after sentence terminator
    const capRegex = /(?:^|[.?!]\s+)([a-z])/g;
    while ((match = capRegex.exec(text)) !== null) {
      const char = match[1];
      const charIndex = match.index + match[0].length - 1;
      issues.push({
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

  // ==========================================
  // 4. CONTEXT-SENSITIVE CONFUSION SETS
  // ==========================================
  checkConfusionSets(text) {
    const issues = [];
    const tokens = [];
    const tokenRegex = /\b[a-zA-Z']+\b/g;
    let m;
    while ((m = tokenRegex.exec(text)) !== null) {
      tokens.push({ word: m[0], start: m.index, end: m.index + m[0].length });
    }

    for (let i = 0; i < tokens.length; i++) {
      const cur = tokens[i];
      const wLower = cur.word.toLowerCase();
      const nextWord = i + 1 < tokens.length ? tokens[i + 1].word.toLowerCase() : "";
      const prevWord = i > 0 ? tokens[i - 1].word.toLowerCase() : "";

      // Their / There / They're
      if (wLower === "their" && ["going", "coming", "doing", "waiting", "planning", "not", "always", "very"].includes(nextWord)) {
        issues.push({
          type: "CONFUSION_SET",
          category: "Context-Sensitive Spelling",
          original: cur.word,
          suggestion: cur.word[0] === cur.word[0].toUpperCase() ? "They're" : "they're",
          explanation: "Use contraction 'they're' ('they are') before a verb/participle.",
          start: cur.start,
          end: cur.end
        });
      } else if (wLower === "their" && ["is", "are", "was", "were", "will", "has", "have", "exists"].includes(nextWord)) {
        issues.push({
          type: "CONFUSION_SET",
          category: "Context-Sensitive Spelling",
          original: cur.word,
          suggestion: cur.word[0] === cur.word[0].toUpperCase() ? "There" : "there",
          explanation: "'There' indicates existential state ('there is/are') or a location.",
          start: cur.start,
          end: cur.end
        });
      } else if (["there", "they're"].includes(wLower) && ["car", "house", "turn", "decision", "dog", "work", "parents", "team", "project"].includes(nextWord)) {
        issues.push({
          type: "CONFUSION_SET",
          category: "Context-Sensitive Spelling",
          original: cur.word,
          suggestion: cur.word[0] === cur.word[0].toUpperCase() ? "Their" : "their",
          explanation: "'Their' is possessive, showing ownership before a noun.",
          start: cur.start,
          end: cur.end
        });
      }

      // Its / It's
      if (wLower === "its" && ["a", "an", "the", "not", "been", "time", "clear", "hard", "easy", "raining"].includes(nextWord)) {
        issues.push({
          type: "CONFUSION_SET",
          category: "Context-Sensitive Spelling",
          original: cur.word,
          suggestion: cur.word[0] === cur.word[0].toUpperCase() ? "It's" : "it's",
          explanation: "'It's' is the contraction for 'it is' or 'it has'.",
          start: cur.start,
          end: cur.end
        });
      } else if (wLower === "it's" && ["color", "tail", "name", "size", "engine", "purpose", "value", "speed", "own"].includes(nextWord)) {
        issues.push({
          type: "CONFUSION_SET",
          category: "Context-Sensitive Spelling",
          original: cur.word,
          suggestion: cur.word[0] === cur.word[0].toUpperCase() ? "Its" : "its",
          explanation: "'Its' is the possessive pronoun without an apostrophe.",
          start: cur.start,
          end: cur.end
        });
      }

      // Then / Than
      if (wLower === "then" && ["more", "less", "better", "worse", "greater", "higher", "lower", "rather"].includes(prevWord)) {
        issues.push({
          type: "CONFUSION_SET",
          category: "Context-Sensitive Spelling",
          original: cur.word,
          suggestion: "than",
          explanation: "'Than' is used for comparisons after comparative adjectives.",
          start: cur.start,
          end: cur.end
        });
      }

      // Loose / Lose
      if (wLower === "loose" && ["to", "will", "might", "can", "don't", "dont", "did"].includes(prevWord)) {
        issues.push({
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

  // ==========================================
  // 5. UNIFIED PROCESS PIPELINE
  // ==========================================
  analyze(text) {
    if (!text || !text.trim()) {
      return {
        issues: [],
        metrics: this.computeReadability(""),
        correctedText: ""
      };
    }

    const issues = [];
    const coveredSpans = new Set();

    // 1. Syntactic Grammar
    const grammarIssues = this.checkGrammar(text);
    for (const g of grammarIssues) {
      issues.push(g);
      for (let pos = g.start; pos < g.end; pos++) coveredSpans.add(pos);
    }

    // 2. Confusion Sets
    const confIssues = this.checkConfusionSets(text);
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

    // 3. Isolated Spelling Typos
    const wordRegex = /\b[a-zA-Z]+(?:'[a-zA-Z]+)?\b/g;
    let wMatch;
    while ((wMatch = wordRegex.exec(text)) !== null) {
      const word = wMatch[0];
      const start = wMatch.index;
      const end = start + word.length;

      let isCovered = false;
      for (let pos = start; pos < end; pos++) {
        if (coveredSpans.has(pos)) { isCovered = true; break; }
      }
      if (isCovered) continue;

      // Allow common single letter words
      if (word.length === 1 && ["a", "i"].includes(word.toLowerCase())) continue;

      if (!LexiconData.isKnown(word)) {
        const cands = this.getSpellingCandidates(word);
        if (cands.length > 0) {
          let best = cands[0].word;
          // Preserve casing
          if (word === word.toUpperCase()) best = best.toUpperCase();
          else if (word[0] === word[0].toUpperCase()) best = best.charAt(0).toUpperCase() + best.slice(1);

          const { distance } = this.computeLevenshteinMatrix(word, best);
          issues.push({
            type: "SPELLING",
            category: "Non-Word Typo",
            original: word,
            suggestion: best,
            candidates: cands.map(c => c.word),
            editDistance: distance,
            explanation: `Misspelled word '${word}'. Suggested correction: '${best}' (Levenshtein distance: ${distance}).`,
            start: start,
            end: end
          });
          for (let pos = start; pos < end; pos++) coveredSpans.add(pos);
        }
      }
    }

    issues.sort((a, b) => a.start - b.start);
    const metrics = this.computeReadability(text);
    const correctedText = this.buildCorrectedText(text, issues);

    return {
      issues,
      metrics,
      correctedText
    };
  }

  buildCorrectedText(text, issues) {
    const sorted = [...issues].sort((a, b) => b.start - a.start);
    const chars = text.split("");
    for (const issue of sorted) {
      if (issue.suggestion && issue.suggestion !== "Consider active voice") {
        chars.splice(issue.start, issue.end - issue.start, issue.suggestion);
      }
    }
    return chars.join("");
  }

  // ==========================================
  // 6. READABILITY & LINGUISTIC METRICS
  // ==========================================
  countSyllables(word) {
    const w = word.toLowerCase().replace(/[^a-z]/g, "");
    if (!w) return 0;
    if (w.length <= 3) return 1;

    let clean = w;
    if (clean.endsWith("e") && !clean.endsWith("le")) {
      clean = clean.slice(0, -1);
    }
    const matches = clean.match(/[aeiouy]+/g);
    return matches ? Math.max(1, matches.length) : 1;
  }

  computeReadability(text) {
    if (!text || !text.trim()) {
      return {
        wordCount: 0,
        sentenceCount: 0,
        charCount: 0,
        fleschEase: 100,
        fleschGrade: 0,
        gunningFog: 0,
        lexicalDiversity: 0,
        readingTimeSec: 0,
        label: "Empty"
      };
    }

    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const sentenceCount = Math.max(1, sentences.length);

    const words = text.match(/\b[a-zA-Z]+(?:'[a-zA-Z]+)?\b/g) || [];
    const wordCount = Math.max(1, words.length);
    const charCount = words.reduce((acc, w) => acc + w.length, 0);

    let totalSyllables = 0;
    let complexWords = 0;
    for (const w of words) {
      const syl = this.countSyllables(w);
      totalSyllables += syl;
      if (syl >= 3) complexWords++;
    }

    const wordsPerSent = wordCount / sentenceCount;
    const sylPerWord = totalSyllables / wordCount;

    // Flesch Reading Ease
    let fleschEase = 206.835 - (1.015 * wordsPerSent) - (84.6 * sylPerWord);
    fleschEase = Math.max(0, Math.min(100, Math.round(fleschEase * 10) / 10));

    // Flesch-Kincaid Grade
    let fleschGrade = (0.39 * wordsPerSent) + (11.8 * sylPerWord) - 15.59;
    fleschGrade = Math.max(0, Math.round(fleschGrade * 10) / 10);

    // Gunning Fog
    const pctComplex = (complexWords / wordCount) * 100;
    let gunningFog = 0.4 * (wordsPerSent + pctComplex);
    gunningFog = Math.max(0, Math.round(gunningFog * 10) / 10);

    // Lexical Diversity (TTR)
    const uniqueSet = new Set(words.map(w => w.toLowerCase()));
    const lexicalDiversity = Math.round((uniqueSet.size / wordCount) * 100) / 100;

    // Reading time (200 wpm)
    const readingTimeSec = Math.max(1, Math.round((wordCount / 200) * 60));

    let label = "Standard";
    if (fleschEase >= 80) label = "Very Easy (Grade 5)";
    else if (fleschEase >= 60) label = "Standard Plain English";
    else if (fleschEase >= 40) label = "Fairly Difficult";
    else label = "Academic / Complex";

    return {
      wordCount,
      sentenceCount,
      charCount,
      fleschEase,
      fleschGrade,
      gunningFog,
      lexicalDiversity,
      uniqueWords: uniqueSet.size,
      readingTimeSec,
      label
    };
  }

  // ==========================================
  // 7. POS TAGGER HEURISTICS
  // ==========================================
  tagPartsOfSpeech(sentence) {
    const tokens = sentence.match(/\b[a-zA-Z]+(?:'[a-zA-Z]+)?\b/g) || [];
    const tagged = [];

    const determiners = new Set(["the", "a", "an", "this", "that", "these", "those", "my", "your", "his", "her", "its", "our", "their"]);
    const prepositions = new Set(["in", "on", "at", "to", "for", "with", "from", "by", "about", "into", "through", "during", "before", "after", "above", "below", "between", "under"]);
    const pronouns = new Set(["i", "you", "he", "she", "it", "we", "they", "me", "him", "her", "us", "them", "who", "whom", "what", "which"]);
    const conjunctions = new Set(["and", "but", "or", "nor", "for", "yet", "so", "because", "although", "since", "unless", "while"]);

    for (let i = 0; i < tokens.length; i++) {
      const w = tokens[i];
      const lower = w.toLowerCase();
      let tag = "NOUN";

      if (determiners.has(lower)) tag = "DETERMINER";
      else if (prepositions.has(lower)) tag = "PREPOSITION";
      else if (pronouns.has(lower)) tag = "PRONOUN";
      else if (conjunctions.has(lower)) tag = "CONJUNCTION";
      else if (lower.endsWith("ly")) tag = "ADVERB";
      else if (lower.endsWith("able") || lower.endsWith("ous") || lower.endsWith("ive") || lower.endsWith("ful") || lower.endsWith("ic")) tag = "ADJECTIVE";
      else if (lower.endsWith("ing") || lower.endsWith("ed") || this.baseToSingular[lower] || ["is", "are", "was", "were", "be", "been", "have", "has", "do", "does", "did"].includes(lower)) tag = "VERB";
      else if (i > 0 && determiners.has(tokens[i - 1].toLowerCase())) tag = "NOUN";

      tagged.push({ token: w, tag: tag });
    }

    return tagged;
  }
}

window.NLPEngine = new NLPEngine();
