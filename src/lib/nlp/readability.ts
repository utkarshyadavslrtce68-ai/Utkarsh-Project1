import { ReadabilityMetrics } from './types';

export function countSyllables(word: string): number {
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

export function computeReadability(text: string): ReadabilityMetrics {
  if (!text || !text.trim()) {
    return {
      wordCount: 0,
      sentenceCount: 0,
      charCount: 0,
      fleschEase: 100,
      fleschGrade: 0,
      gunningFog: 0,
      lexicalDiversity: 0,
      uniqueWords: 0,
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
    const syl = countSyllables(w);
    totalSyllables += syl;
    if (syl >= 3) complexWords++;
  }

  const wordsPerSent = wordCount / sentenceCount;
  const sylPerWord = totalSyllables / wordCount;

  // Flesch Reading Ease Formula
  let fleschEase = 206.835 - (1.015 * wordsPerSent) - (84.6 * sylPerWord);
  fleschEase = Math.max(0, Math.min(100, Math.round(fleschEase * 10) / 10));

  // Flesch-Kincaid Grade Level Formula
  let fleschGrade = (0.39 * wordsPerSent) + (11.8 * sylPerWord) - 15.59;
  fleschGrade = Math.max(0, Math.round(fleschGrade * 10) / 10);

  // Gunning Fog Index Formula
  const pctComplex = (complexWords / wordCount) * 100;
  let gunningFog = 0.4 * (wordsPerSent + pctComplex);
  gunningFog = Math.max(0, Math.round(gunningFog * 10) / 10);

  // Lexical Diversity (Type-Token Ratio - TTR)
  const uniqueSet = new Set(words.map(w => w.toLowerCase()));
  const lexicalDiversity = Math.round((uniqueSet.size / wordCount) * 100) / 100;

  // Reading time (average 200 words per minute)
  const readingTimeSec = Math.max(1, Math.round((wordCount / 200) * 60));

  let label = "Standard";
  if (fleschEase >= 80) label = "Very Easy (Grade 5)";
  else if (fleschEase >= 60) label = "Standard Plain English";
  else if (fleschEase >= 40) label = "Fairly Difficult (College)";
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
