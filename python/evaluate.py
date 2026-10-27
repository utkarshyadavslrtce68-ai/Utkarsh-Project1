"""
Benchmark & Evaluation Suite for NLP Spelling and Grammar Checker
Measures Precision, Recall, and F1-Score on gold-standard test sentences.
"""

import sys
import os
import json

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from python.nlp_pipeline import NLPPipeline


def run_benchmark():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    test_file = os.path.join(base_dir, "data", "test_sentences.json")

    if not os.path.exists(test_file):
        print(f"[Error] Test file not found at {test_file}")
        return

    with open(test_file, "r", encoding="utf-8") as f:
        test_cases = json.load(f)

    pipeline = NLPPipeline()

    total_gold_errors = 0
    true_positives = 0
    false_positives = 0
    false_negatives = 0

    print("=" * 75)
    print("NLP SPELLING & GRAMMAR CHECKER BENCHMARK EVALUATION")
    print("=" * 75)

    for idx, case in enumerate(test_cases, 1):
        cat = case.get("category", "General")
        inp = case["input"]
        expected = case["expected_errors"]
        total_gold_errors += len(expected)

        res = pipeline.process(inp)
        detected_words = [i["original"] for i in res["issues"]]

        # Match detected against expected
        tp = 0
        for exp in expected:
            # Check if expected error was matched in detected words or suggestions
            if any(exp.lower() in d.lower() or d.lower() in exp.lower() for d in detected_words):
                tp += 1

        fn = len(expected) - tp
        fp = max(0, len(detected_words) - tp)

        true_positives += tp
        false_negatives += fn
        false_positives += fp

        status = "[PASS]" if tp == len(expected) and fp == 0 else "[PARTIAL]" if tp > 0 else "[FAIL]"
        print(f"\nTest #{idx}: {status} | Category: {cat}")
        print(f"  Input:    \"{inp}\"")
        print(f"  Expected: {expected}")
        print(f"  Detected: {detected_words}")
        print(f"  Corrected:\"{res['corrected_text']}\"")

    # Metrics computation
    precision = true_positives / (true_positives + false_positives) if (true_positives + false_positives) > 0 else 0
    recall = true_positives / (true_positives + false_negatives) if (true_positives + false_negatives) > 0 else 0
    f1 = 2 * (precision * recall) / (precision + recall) if (precision + recall) > 0 else 0

    print("\n" + "=" * 75)
    print("SUMMARY METRICS")
    print("=" * 75)
    print(f" Total Test Cases Evaluated:   {len(test_cases)}")
    print(f" Total Gold Standard Errors:   {total_gold_errors}")
    print(f" True Positives (TP):          {true_positives}")
    print(f" False Positives (FP):         {false_positives}")
    print(f" False Negatives (FN):         {false_negatives}")
    print("-" * 75)
    print(f" Precision:                    {precision * 100:.2f}%")
    print(f" Recall:                       {recall * 100:.2f}%")
    print(f" F1-Score:                     {f1 * 100:.2f}%")
    print("=" * 75)


if __name__ == "__main__":
    run_benchmark()
