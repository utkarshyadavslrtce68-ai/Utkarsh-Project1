"""
Command-Line Interface for NLP Spelling and Grammar Checker
Supports text analysis, file processing, interactive REPL, and DP matrix visualization.
"""

import sys
import argparse
import os

# Add project root to sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from python.nlp_pipeline import NLPPipeline
from python.edit_distance import levenshtein_matrix, format_dp_matrix, backtrack_alignment


def print_banner():
    banner = r"""
  _              _  ____ _               _    
 | |    _____  _(_)/ ___| |__   ___  ___| | __
 | |   / _ \ \/ / | |   | '_ \ / _ \/ __| |/ /
 | |__|  __/>  <| | |___| | | |  __/ (__|   < 
 |_____\___/_/\_\_|\____|_| |_|\___|\___|_|\_\
 NLP Spelling, Grammar & Linguistic Analysis System
    """
    print(banner)


def display_results(result: dict):
    print("\n" + "=" * 65)
    print(f"ANALYSIS REPORT (Total Issues Detected: {result['summary']['total']})")
    print(f"  * Spelling: {result['summary']['spelling']} | Grammar: {result['summary']['grammar']} | Style: {result['summary']['style']}")
    print("=" * 65)

    if not result["issues"]:
        print(" [OK] No spelling or grammatical errors found! Text looks great.")
    else:
        for idx, issue in enumerate(result["issues"], 1):
            badge = f"[{issue['type']}]"
            print(f"\n {idx}. {badge:12} '{issue['original']}' -> '{issue['suggestion']}'")
            print(f"    Category:   {issue['category']}")
            print(f"    Reason:     {issue['explanation']}")
            if "edit_distance" in issue:
                print(f"    Edit Dist:  {issue['edit_distance']}")

    print("\n" + "-" * 65)
    print("SUGGESTED REVISION:")
    print("-" * 65)
    print(result["corrected_text"])

    print("\n" + "-" * 65)
    print("READABILITY & LINGUISTIC METRICS:")
    print("-" * 65)
    r = result["readability"]
    print(f"  * Words:               {r['word_count']} words in {r['sentence_count']} sentences")
    print(f"  * Flesch Reading Ease: {r['flesch_reading_ease']} / 100 ({r['complexity_label']})")
    print(f"  * Flesch-Kincaid Grade:{r['flesch_kincaid_grade']} (US School Grade Level)")
    print(f"  * Gunning Fog Index:   {r['gunning_fog']}")
    print(f"  * Lexical Diversity:   {r['lexical_diversity']} (Type-Token Ratio)")
    print(f"  * Est. Reading Time:   {r['reading_time_seconds']} sec")
    print("=" * 65 + "\n")


def main():
    parser = argparse.ArgumentParser(description="NLP Spelling and Grammar Checker CLI")
    parser.add_argument("--text", "-t", type=str, help="Single sentence or paragraph to check")
    parser.add_argument("--file", "-f", type=str, help="Path to text file (.txt) to analyze")
    parser.add_argument("--matrix", "-m", nargs=2, metavar=("WORD1", "WORD2"), help="Show Levenshtein DP Matrix for two words")
    parser.add_argument("--interactive", "-i", action="store_true", help="Launch interactive prompt REPL")

    args = parser.parse_args()
    print_banner()

    # Dynamic Programming Matrix Inspection
    if args.matrix:
        w1, w2 = args.matrix
        dist, dp = levenshtein_matrix(w1, w2)
        print(f"\nLevenshtein Distance between '{w1}' and '{w2}': {dist}")
        print("\nDynamic Programming Alignment Table:")
        print(format_dp_matrix(w1, w2, dp))
        print("\nBacktraced Edit Operations:")
        for op in backtrack_alignment(w1, w2, dp):
            print(f"  * {op['operation']}: '{op['source_char']}' -> '{op['target_char']}'")
        return

    pipeline = NLPPipeline()

    # Single text check
    if args.text:
        res = pipeline.process(args.text)
        display_results(res)
        return

    # File check
    if args.file:
        if not os.path.exists(args.file):
            print(f"[Error] File not found: {args.file}")
            sys.exit(1)
        with open(args.file, "r", encoding="utf-8") as f:
            content = f.read()
        res = pipeline.process(content)
        display_results(res)
        return

    # Interactive REPL or Default demo
    if args.interactive or len(sys.argv) == 1:
        print("Entering interactive mode. Type your text below and press Enter (type 'exit' or 'quit' to quit):")
        while True:
            try:
                line = input("\n[Enter text] > ").strip()
                if not line:
                    continue
                if line.lower() in ["exit", "quit", "q"]:
                    print("Exiting. Have a great day!")
                    break
                res = pipeline.process(line)
                display_results(res)
            except (KeyboardInterrupt, EOFError):
                print("\nExiting.")
                break


if __name__ == "__main__":
    main()
