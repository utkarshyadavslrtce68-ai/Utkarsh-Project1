export type IssueType = 'SPELLING' | 'GRAMMAR' | 'STYLE' | 'CONFUSION_SET';

export interface NLPIssue {
  id: string;
  type: IssueType;
  category: string;
  original: string;
  suggestion: string;
  candidates?: string[];
  editDistance?: number;
  explanation: string;
  start: number;
  end: number;
}

export interface ReadabilityMetrics {
  wordCount: number;
  sentenceCount: number;
  charCount: number;
  fleschEase: number;
  fleschGrade: number;
  gunningFog: number;
  lexicalDiversity: number;
  uniqueWords: number;
  readingTimeSec: number;
  label: string;
}

export interface NLPAnalysisResult {
  issues: NLPIssue[];
  metrics: ReadabilityMetrics;
  correctedText: string;
}

export interface DPOperation {
  type: 'MATCH' | 'INSERT' | 'DELETE' | 'SUBSTITUTE';
  sourceChar: string;
  targetChar: string;
  i: number;
  j: number;
}

export interface DPMatrixResult {
  distance: number;
  matrix: number[][];
  operations: DPOperation[];
}

export interface NorvigCandidate {
  word: string;
  editDistance: number;
  frequency: number;
  priorProbability: number;
}

export interface POSToken {
  token: string;
  tag: 'NOUN' | 'VERB' | 'ADJECTIVE' | 'ADVERB' | 'PRONOUN' | 'PREPOSITION' | 'DETERMINER' | 'CONJUNCTION';
}
