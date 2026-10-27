"""
Unit Tests for Spelling Correction and Edit Distance
"""

import unittest
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from python.edit_distance import levenshtein_matrix, damerau_levenshtein, backtrack_alignment
from python.norvig_spell import NorvigSpellingCorrector


class TestEditDistance(unittest.TestCase):
    def test_exact_match(self):
        dist, dp = levenshtein_matrix("apple", "apple")
        self.assertEqual(dist, 0)

    def test_single_insertion(self):
        dist, dp = levenshtein_matrix("cat", "cats")
        self.assertEqual(dist, 1)

    def test_single_deletion(self):
        dist, dp = levenshtein_matrix("sitting", "sittin")
        self.assertEqual(dist, 1)

    def test_single_substitution(self):
        dist, dp = levenshtein_matrix("recieve", "receive")
        # In standard Levenshtein, swapping adjacent 'ie' to 'ei' is 2 substitutions or 1 insertion + 1 deletion
        self.assertEqual(dist, 2)

    def test_damerau_transposition(self):
        dist, dp = damerau_levenshtein("recieve", "receive")
        # In Damerau-Levenshtein, transposition of 'ie' to 'ei' is 1 operation!
        self.assertEqual(dist, 1)

    def test_backtrack_operations(self):
        dist, dp = levenshtein_matrix("cat", "cot")
        ops = backtrack_alignment("cat", "cot", dp)
        sub_ops = [op for op in ops if op["operation"] == "SUBSTITUTE"]
        self.assertEqual(len(sub_ops), 1)
        self.assertEqual(sub_ops[0]["source_char"], "a")
        self.assertEqual(sub_ops[0]["target_char"], "o")


class TestNorvigSpeller(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.speller = NorvigSpellingCorrector()

    def test_known_word(self):
        self.assertTrue(self.speller.is_known("the"))
        self.assertTrue(self.speller.is_known("computer"))

    def test_typo_correction(self):
        self.assertEqual(self.speller.correction("definately").lower(), "definitely")
        self.assertEqual(self.speller.correction("goverment").lower(), "government")
        self.assertEqual(self.speller.correction("tomorow").lower(), "tomorrow")

    def test_preserves_capitalization(self):
        self.assertEqual(self.speller.correction("Definately"), "Definitely")


if __name__ == "__main__":
    unittest.main()
