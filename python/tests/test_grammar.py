"""
Unit Tests for Grammar, Confusion Sets, and Syntactic Rules
"""

import unittest
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from python.grammar_checker import GrammarChecker
from python.confusion_sets import check_confusion_sets
from python.readability import analyze_readability


class TestGrammarRules(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.checker = GrammarChecker()

    def test_article_agreement(self):
        issues = cls.checker.check("She bought a apple and an car.")
        categories = [i["category"] for i in issues]
        self.assertIn("Article Agreement", categories)
        suggestions = [i["suggestion"] for i in issues]
        self.assertTrue(any("an apple" in s for s in suggestions))
        self.assertTrue(any("a car" in s for s in suggestions))

    def test_subject_verb_agreement(self):
        issues = cls.checker.check("He study hard every day.")
        categories = [i["category"] for i in issues]
        self.assertIn("Subject-Verb Agreement", categories)
        self.assertEqual(issues[0]["suggestion"], "he studies")

    def test_double_negatives(self):
        issues = cls.checker.check("I don't need no advice.")
        self.assertTrue(any(i["category"] == "Double Negative" for i in issues))

    def test_redundancy(self):
        issues = cls.checker.check("Please revert back with the end result.")
        categories = [i["category"] for i in issues]
        self.assertIn("Redundancy", categories)


class TestConfusionSets(unittest.TestCase):
    def test_their_there_theyre(self):
        errors = check_confusion_sets("Their going to the market.")
        self.assertTrue(len(errors) > 0)
        self.assertEqual(errors[0]["suggestion"].lower(), "they're")

    def test_its_it_is(self):
        errors = check_confusion_sets("Its a great day.")
        self.assertTrue(len(errors) > 0)
        self.assertEqual(errors[0]["suggestion"].lower(), "it's")


class TestReadability(unittest.TestCase):
    def test_flesch_reading_ease(self):
        text = "The cat sat on the mat. It was a nice cat."
        metrics = analyze_readability(text)
        self.assertGreater(metrics["flesch_reading_ease"], 80)
        self.assertGreater(metrics["word_count"], 0)


if __name__ == "__main__":
    unittest.main()
