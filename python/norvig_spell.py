"""
Peter Norvig's Probabilistic Spelling Corrector
Part of NLP Spelling and Grammar Checker Project.

Theoretical Foundation (Bayesian Model of Spelling Correction):
We seek candidate word 'c' that maximizes P(c|w), the probability that word 'c' was intended
given that word 'w' was typed:
    argmax_c P(c|w) = argmax_c [ P(w|c) * P(c) / P(w) ]
Since P(w) is independent of c, this simplifies to:
    argmax_c P(w|c) * P(c)

Where:
- P(c): Prior probability of word 'c' occurring in natural language corpus (Language Model)
- P(w|c): Error likelihood model (Noisy Channel Model) - estimated based on edit distance:
    * Distance 0 (c = w): 0 edits
    * Distance 1: deletion, transposition, replacement, insertion (~80% of human typos)
    * Distance 2: compound errors
"""

import re
import math
from collections import Counter
from typing import List, Set, Dict, Tuple, Optional


# Embedded high-frequency starter lexicon (~1000 common words) ensuring immediate functionality
DEFAULT_LEXICON = """
the of and a to in is you that it he was for on are as with his they i at be this have from
or one had by word but not what all were we when your can said there use an each which she
do how their if will up other about out many then them these so some her would make like
him into time has look two more write go see number no way could people my than first water
been call who oil its now find long down day did get come made may part over new sound take
only little work know place year live me back give most very after thing our just name sentence
man think say great where much through before line right too mean old any same tell boy follow
came want show also around form three small set put end does another well large must big even
such because turn here why ask went men read need land different home us move try kind hand
picture again change off play spell air away animal house point page letter mother answer
found study still learn should America world high every near add food between own below
country plant last school father keep tree never start city earth eye light thought head
under story saw left few while along might close something seem next hard open example
begin life always those both paper together got group often run important until children
side feet car mile night walk white sea began grow took river four carry state once book
hear stop without second late miss idea enough eat face watch far real almost let above
girl sometimes mountain cut young talk soon list song being leave family direct pose song
measure door product black short numeral class wind question happen complete ship area
half rock order fire south problem piece told knew pass since top whole king space heard
best hour better true during hundred five remember step early hold west ground interest
reach fast verb sing listen six table travel less morning ten simple several vowel toward
war lay against pattern slow center love person money serve appear road map rain rule
govern pull cold notice voice unit power town fine certain fly fall lead cry dark machine
note wait plan figure star box noun field rest correct able pound done beauty drive stood
contain front teach week final gave green oh quick develop ocean warm free minute strong
special mind behind clear tail produce fact street inch multiply nothing course stay wheel
full force blue object decide surface deep moon island foot system busy test record boat
common gold possible plane steadfast dry wonder laugh thousand ago ran check game shape
equate hot miss brought heat snow tire bring yes distant fill east paint language among
unit power town fine certain receive definitely accommodate separate business tomorrow
necessary noticeable argument publicly calendar environment government until whether foreign
friend column gauge rhythm hierarchy guarantee license questionnaire recommendation
successful thoroughly maintenance knowledge privilege supersede believe grammar rhythm
"""


class NorvigSpellingCorrector:
    def __init__(self, corpus_path: Optional[str] = None):
        """
        Initializes the spelling corrector by compiling word frequency counts.
        """
        self.words_count: Counter = Counter()
        self.total_words: int = 0
        self.custom_words: Set[str] = set()

        # Seed with default lexicon
        self._train_text(DEFAULT_LEXICON)

        # Train with corpus file if provided
        if corpus_path:
            try:
                with open(corpus_path, "r", encoding="utf-8") as f:
                    self._train_text(f.read())
            except Exception as e:
                print(f"[Warning] Could not load corpus from {corpus_path}: {e}")

    def _train_text(self, text: str):
        """Extracts words and updates frequency counts."""
        tokens = re.findall(r"\b[a-z]+(?:'[a-z]+)?\b", text.lower())
        self.words_count.update(tokens)
        self.total_words = sum(self.words_count.values())

    def add_custom_word(self, word: str, frequency: int = 100):
        """Adds a custom word to the personal dictionary."""
        word_clean = word.strip().lower()
        self.custom_words.add(word_clean)
        self.words_count[word_clean] += frequency
        self.total_words += frequency

    def is_known(self, word: str) -> bool:
        """Checks if a word is in the vocabulary."""
        return word.lower() in self.words_count or word.lower() in self.custom_words

    def probability(self, word: str) -> float:
        """P(c): Prior probability of candidate word."""
        if self.total_words == 0:
            return 0.0
        return self.words_count[word.lower()] / self.total_words

    def edits1(self, word: str) -> Set[str]:
        """Generates all strings that are 1 edit distance away from word."""
        letters = "abcdefghijklmnopqrstuvwxyz"
        splits = [(word[:i], word[i:]) for i in range(len(word) + 1)]
        deletes = [L + R[1:] for L, R in splits if R]
        transposes = [L + R[1] + R[0] + R[2:] for L, R in splits if len(R) > 1]
        replaces = [L + c + R[1:] for L, R in splits if R for c in letters]
        inserts = [L + c + R for L, R in splits for c in letters]
        return set(deletes + transposes + replaces + inserts)

    def edits2(self, word: str) -> Set[str]:
        """Generates all strings that are 2 edit distances away."""
        return {e2 for e1 in self.edits1(word) for e2 in self.edits1(e1)}

    def known(self, words: Set[str]) -> Set[str]:
        """Returns the subset of words that exist in the dictionary."""
        return {w for w in words if w in self.words_count}

    def candidates(self, word: str) -> List[Tuple[str, int, float]]:
        """
        Generates candidate corrections ranked by edit distance and prior probability.

        Returns:
            List of tuples: (candidate_word, edit_distance, prior_probability)
        """
        w = word.lower()
        
        # Edit distance 0 (exact match)
        if self.is_known(w):
            return [(w, 0, self.probability(w))]

        # Edit distance 1
        e1_known = self.known(self.edits1(w))
        if e1_known:
            sorted_e1 = sorted(e1_known, key=self.probability, reverse=True)
            return [(c, 1, self.probability(c)) for c in sorted_e1[:5]]

        # Edit distance 2
        e2_known = self.known(self.edits2(w))
        if e2_known:
            sorted_e2 = sorted(e2_known, key=self.probability, reverse=True)
            return [(c, 2, self.probability(c)) for c in sorted_e2[:5]]

        # Fallback to original word
        return [(word, -1, 0.0)]

    def correction(self, word: str) -> str:
        """Returns the single most likely spelling correction for word."""
        cands = self.candidates(word)
        if not cands or cands[0][1] == -1:
            return word
        
        best_cand = cands[0][0]
        # Preserve original capitalization
        if word.isupper():
            return best_cand.upper()
        if word.istitle():
            return best_cand.capitalize()
        return best_cand


if __name__ == "__main__":
    corrector = NorvigSpellingCorrector("../data/corpus.txt")
    test_words = ["definately", "recieve", "goverment", "tomorow", "univesity", "computr"]
    
    print("=== Norvig Bayesian Spelling Corrector Demo ===")
    for tw in test_words:
        cands = corrector.candidates(tw)
        best = corrector.correction(tw)
        print(f"\nQuery: '{tw}' -> Best Correction: '{best}'")
        print("  Candidate breakdown:")
        for cand, dist, prob in cands:
            print(f"   * '{cand}' | Edit Dist: {dist} | P(c): {prob:.6f}")
