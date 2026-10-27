"""
Unified NLP Spelling and Grammar Checking Pipeline
Orchestrates spelling, grammar, confusion sets, and readability modules.
"""

import os
import re
from typing import Dict, Any, List

from python.edit_distance import levenshtein_matrix, backtrack_alignment
from python.norvig_spell import NorvigSpellingCorrector
from python.confusion_sets import check_confusion_sets
from python.grammar_checker import GrammarChecker
from python.readability import analyze_readability


class NLPPipeline:
    def __init__(self, corpus_path: str = None):
        # Resolve corpus path
        if not corpus_path:
            base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            candidate = os.path.join(base_dir, "data", "corpus.txt")
            if os.path.exists(candidate):
                corpus_path = candidate

        self.spell_checker = NorvigSpellingCorrector(corpus_path)
        self.grammar_checker = GrammarChecker()

    def process(self, text: str) -> Dict[str, Any]:
        """
        Executes complete NLP pipeline over input text.

        Returns structured dictionary containing:
        - raw_text: Original input
        - issues: List of detected errors with start, end, type, category, suggestion, explanation
        - readability: Flesch, Grade, Lexical Diversity metrics
        - corrected_text: Full auto-corrected string
        - summary: Counts of spelling vs grammar vs style issues
        """
        if not text or not text.strip():
            return {
                "raw_text": text,
                "issues": [],
                "readability": analyze_readability(""),
                "corrected_text": text,
                "summary": {"total": 0, "spelling": 0, "grammar": 0, "style": 0}
            }

        issues: List[Dict[str, Any]] = []

        # 1. Grammar Checks (Agreement, Articles, Repetitions, Contractions)
        grammar_issues = self.grammar_checker.check(text)
        issues.extend(grammar_issues)

        # 2. Confusion Sets (Context-sensitive real-word errors)
        confusion_issues = check_confusion_sets(text)
        # Avoid duplicate spans
        covered_spans = {(g["start"], g["end"]) for g in grammar_issues}
        for c in confusion_issues:
            if (c["start"], c["end"]) not in covered_spans:
                issues.append(c)
                covered_spans.add((c["start"], c["end"]))

        # 3. Non-word Spelling Checks
        word_matches = list(re.finditer(r"\b[a-zA-Z]+(?:'[a-zA-Z]+)?\b", text))
        for m in word_matches:
            span = (m.start(), m.end())
            # Skip if this token was already flagged as part of grammar or confusion issue
            if any(span[0] >= g[0] and span[1] <= g[1] for g in covered_spans):
                continue

            word = m.group(0)
            # Skip numbers or single-letter acronyms / common solitary letters
            if len(word) == 1 and word.lower() in ["a", "i"]:
                continue

            # Check if word is known in lexicon
            if not self.spell_checker.is_known(word):
                cands = self.spell_checker.candidates(word)
                if cands and cands[0][1] != -1:
                    best_cand = self.spell_checker.correction(word)
                    top_candidates = [c[0] for c in cands[:3]]
                    dist, _ = levenshtein_matrix(word, best_cand)
                    
                    issues.append({
                        "type": "SPELLING",
                        "category": "Non-Word Typo",
                        "original": word,
                        "suggestion": best_cand,
                        "candidates": top_candidates,
                        "edit_distance": dist,
                        "explanation": f"Unknown word '{word}'. Did you mean '{best_cand}'? (Edit distance: {dist})",
                        "start": m.start(),
                        "end": m.end()
                    })
                    covered_spans.add(span)

        # Sort all issues chronologically by start index
        issues.sort(key=lambda x: x["start"])

        # Compute Readability & Lexical Metrics
        readability = analyze_readability(text)

        # Produce Auto-Corrected Version
        corrected_text = self._apply_corrections(text, issues)

        # Summary Breakdown
        summary = {
            "total": len(issues),
            "spelling": sum(1 for i in issues if i["type"] == "SPELLING"),
            "grammar": sum(1 for i in issues if i["type"] == "GRAMMAR"),
            "style": sum(1 for i in issues if i["type"] == "STYLE" or i["type"] == "CONFUSION_SET")
        }

        return {
            "raw_text": text,
            "issues": issues,
            "readability": readability,
            "corrected_text": corrected_text,
            "summary": summary
        }

    def _apply_corrections(self, text: str, issues: List[Dict[str, Any]]) -> str:
        """
        Replaces detected spans from right to left to avoid index displacement.
        """
        # Sort reverse by start position
        sorted_issues = sorted(issues, key=lambda x: x["start"], reverse=True)
        chars = list(text)

        for issue in sorted_issues:
            start = issue["start"]
            end = issue["end"]
            replacement = issue["suggestion"]
            if replacement and replacement != "Consider active voice":
                chars[start:end] = list(replacement)

        return "".join(chars)


if __name__ == "__main__":
    pipeline = NLPPipeline()
    sample = "The scientist study the chemical reaction carefully. She bought a apple and recieved it tomorow. Their going home."
    result = pipeline.process(sample)

    print("=== NLP Pipeline Execution ===")
    print("Original Text:", sample)
    print("\nDetected Issues:")
    for issue in result["issues"]:
        print(f" * [{issue['type']}] '{issue['original']}' -> '{issue['suggestion']}' ({issue['explanation']})")
    
    print("\nAuto-Corrected Text:")
    print(result["corrected_text"])

    print("\nReadability Statistics:")
    for k, v in result["readability"].items():
        print(f" * {k}: {v}")
