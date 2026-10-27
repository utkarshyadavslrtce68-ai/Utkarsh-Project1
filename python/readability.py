"""
Readability & Linguistic Quality Metrics Module
Part of NLP Spelling and Grammar Checker Project.

Theoretical Foundation:
Readability metrics quantify text difficulty using surface statistical features of language:
sentence length, word length (in syllables or characters), and lexical richness.
Widely used across educational technology, publishing, and legal document assessment.
"""

import re
from typing import Dict, Any


def count_syllables(word: str) -> int:
    """
    Estimates syllable count using English phonological vowel grouping rules.
    """
    word = word.lower().strip()
    if not word:
        return 0
    if len(word) <= 3:
        return 1

    # Remove non-alphabetic characters
    word = re.sub(r"[^a-z]", "", word)
    
    # Remove trailing silent 'e'
    if word.endswith("e") and not word.endswith("le"):
        word = word[:-1]

    # Count vowel groups
    vowel_runs = re.findall(r"[aeiouy]+", word)
    count = len(vowel_runs)

    return max(1, count)


def analyze_readability(text: str) -> Dict[str, Any]:
    """
    Computes linguistic complexity metrics, readability indices, and lexical diversity.
    """
    if not text.strip():
        return {
            "word_count": 0,
            "sentence_count": 0,
            "character_count": 0,
            "flesch_reading_ease": 100.0,
            "flesch_kincaid_grade": 0.0,
            "gunning_fog": 0.0,
            "lexical_diversity": 0.0,
            "reading_time_seconds": 0,
            "complexity_label": "Empty"
        }

    # Sentence segmentation
    sentences = [s.strip() for s in re.split(r"[.!?]+", text) if s.strip()]
    sentence_count = max(1, len(sentences))

    # Word tokenization
    words = re.findall(r"\b[a-zA-Z]+(?:'[a-zA-Z]+)?\b", text)
    word_count = max(1, len(words))
    character_count = sum(len(w) for w in words)

    # Syllables
    syllable_counts = [count_syllables(w) for w in words]
    total_syllables = sum(syllable_counts)
    complex_words = sum(1 for s in syllable_counts if s >= 3)

    # Ratios
    words_per_sentence = word_count / sentence_count
    syllables_per_word = total_syllables / word_count

    # 1. Flesch Reading Ease Formula
    flesch_ease = 206.835 - (1.015 * words_per_sentence) - (84.6 * syllables_per_word)
    flesch_ease = max(0.0, min(100.0, round(flesch_ease, 1)))

    # 2. Flesch-Kincaid Grade Level Formula
    fk_grade = (0.39 * words_per_sentence) + (11.8 * syllables_per_word) - 15.59
    fk_grade = max(0.0, round(fk_grade, 1))

    # 3. Gunning Fog Index
    pct_complex = (complex_words / word_count) * 100
    gunning_fog = 0.4 * (words_per_sentence + pct_complex)
    gunning_fog = max(0.0, round(gunning_fog, 1))

    # 4. Lexical Diversity (Type-Token Ratio - TTR)
    unique_words = len(set(w.lower() for w in words))
    ttr = round(unique_words / word_count, 3)

    # Reading time (assuming 200 words per minute)
    reading_seconds = max(1, round((word_count / 200) * 60))

    # Qualitative complexity descriptor
    if flesch_ease >= 80:
        label = "Very Easy (5th Grade Level)"
    elif flesch_ease >= 60:
        label = "Standard (Plain English, 8th-9th Grade)"
    elif flesch_ease >= 40:
        label = "Fairly Difficult (High School / College)"
    else:
        label = "Difficult (Technical / Academic)"

    return {
        "word_count": word_count,
        "sentence_count": sentence_count,
        "character_count": character_count,
        "flesch_reading_ease": flesch_ease,
        "flesch_kincaid_grade": fk_grade,
        "gunning_fog": gunning_fog,
        "lexical_diversity": ttr,
        "unique_word_count": unique_words,
        "reading_time_seconds": reading_seconds,
        "complexity_label": label
    }


if __name__ == "__main__":
    sample = (
        "Natural language processing enables computers to understand human speech and writing. "
        "Computational linguistics combines rule-based modeling with modern statistical algorithms. "
        "Evaluating sentence complexity requires rigorous metrics like the Flesch reading ease score."
    )
    res = analyze_readability(sample)
    print("Readability Analysis:")
    for k, v in res.items():
        print(f"  {k}: {v}")
