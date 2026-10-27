"""
Context-Sensitive Real-Word Error Detection (Confusion Sets)
Part of NLP Spelling and Grammar Checker Project.

Theoretical Foundation:
Real-word spelling errors occur when a typist produces a valid lexicon entry that is incorrect
in its syntactic/semantic context (e.g., "They drove their car" vs "Their going home").
Standard spell checkers fail here because both 'their' and 'they're' exist in the dictionary.
This module uses N-gram context heuristics, collocation triggers, and syntactic category constraints
to resolve ambiguity within predefined confusion sets.
"""

import re
from typing import List, Dict, Any, Optional


CONFUSION_RULES = [
    {
        "set": ["their", "there", "they're"],
        "detect": lambda tokens, i: (
            # "their" followed by verb (e.g. "their going", "their is", "their are") -> "they're" or "there"
            ("they're", "Used before a verb/action or contraction of 'they are'.",
             tokens[i].lower() == "their" and i + 1 < len(tokens) and tokens[i + 1].lower() in ["going", "coming", "doing", "waiting", "planning", "not", "always", "very"]) or
            ("there", "'There' indicates a place, location, or existential construction (there is/are).",
             tokens[i].lower() == "their" and i + 1 < len(tokens) and tokens[i + 1].lower() in ["is", "are", "was", "were", "will", "has", "have", "seems", "exists"]) or
            ("their", "'Their' is possessive, showing ownership before a noun.",
             tokens[i].lower() in ["there", "they're"] and i + 1 < len(tokens) and tokens[i + 1].lower() in ["car", "house", "turn", "decision", "dog", "work", "parents", "team", "project", "system", "time"])
        )
    },
    {
        "set": ["its", "it's"],
        "detect": lambda tokens, i: (
            ("it's", "Contraction for 'it is' or 'it has'.",
             tokens[i].lower() == "its" and i + 1 < len(tokens) and tokens[i + 1].lower() in ["a", "an", "the", "not", "been", "time", "important", "clear", "hard", "easy", "raining", "going", "my", "your"]) or
            ("its", "Possessive pronoun indicating ownership without apostrophe.",
             tokens[i].lower() in ["it's", "its'"] and i + 1 < len(tokens) and tokens[i + 1].lower() in ["color", "tail", "name", "size", "engine", "purpose", "value", "speed", "own", "legs"])
        )
    },
    {
        "set": ["your", "you're"],
        "detect": lambda tokens, i: (
            ("you're", "Contraction for 'you are'.",
             tokens[i].lower() == "your" and i + 1 < len(tokens) and tokens[i + 1].lower() in ["welcome", "going", "doing", "right", "wrong", "the", "a", "an", "not", "late", "invited"]) or
            ("your", "Possessive pronoun indicating ownership.",
             tokens[i].lower() == "you're" and i + 1 < len(tokens) and tokens[i + 1].lower() in ["car", "book", "name", "turn", "idea", "computer", "phone", "friend", "home"])
        )
    },
    {
        "set": ["affect", "effect"],
        "detect": lambda tokens, i: (
            ("affect", "'Affect' is typically a verb meaning to influence.",
             tokens[i].lower() == "effect" and i > 0 and tokens[i - 1].lower() in ["will", "would", "can", "could", "may", "might", "to", "not"]) or
            ("effect", "'Effect' is typically a noun meaning the result or outcome.",
             tokens[i].lower() == "affect" and i > 0 and tokens[i - 1].lower() in ["the", "a", "an", "this", "that", "side", "cause", "and", "adverse", "positive", "negative"])
        )
    },
    {
        "set": ["then", "than"],
        "detect": lambda tokens, i: (
            ("than", "Used for comparisons (e.g., 'better than', 'more than').",
             tokens[i].lower() == "then" and i > 0 and tokens[i - 1].lower() in ["more", "less", "better", "worse", "greater", "higher", "lower", "rather", "other", "faster", "slower", "earlier", "later"]) or
            ("then", "Refers to time or sequence (e.g., 'and then', 'since then').",
             tokens[i].lower() == "than" and (
                 (i > 0 and tokens[i - 1].lower() in ["and", "since", "until", "back", "even", "if"]) or
                 (i + 1 < len(tokens) and tokens[i + 1].lower() in ["we", "i", "they", "he", "she", "it"])
             ))
        )
    },
    {
        "set": ["loose", "lose"],
        "detect": lambda tokens, i: (
            ("lose", "Verb meaning to fail to keep or misplace.",
             tokens[i].lower() == "loose" and i > 0 and tokens[i - 1].lower() in ["to", "will", "might", "can", "don't", "dont", "did", "not"]) or
            ("loose", "Adjective meaning not tight or unbound.",
             tokens[i].lower() == "lose" and i + 1 < len(tokens) and tokens[i + 1].lower() in ["clothing", "tooth", "change", "rope", "connection", "fitting", "hair"])
        )
    },
    {
        "set": ["accept", "except"],
        "detect": lambda tokens, i: (
            ("accept", "Verb meaning to receive or agree to.",
             tokens[i].lower() == "except" and i > 0 and tokens[i - 1].lower() in ["will", "can", "to", "please", "i", "we", "they", "must"]) or
            ("except", "Preposition meaning excluding or but.",
             tokens[i].lower() == "accept" and i > 0 and tokens[i - 1].lower() in ["all", "everyone", "everything", "nobody", "none", "everywhere"])
        )
    },
    {
        "set": ["to", "too", "two"],
        "detect": lambda tokens, i: (
            ("too", "Adverb meaning also, excessively (e.g. 'too much', 'me too').",
             tokens[i].lower() == "to" and i + 1 < len(tokens) and tokens[i + 1].lower() in ["much", "many", "late", "far", "fast", "slow", "expensive", "cold", "hot", "bad", "good"])
        )
    }
]


def check_confusion_sets(text: str) -> List[Dict[str, Any]]:
    """
    Scans text for context-sensitive real-word errors within common confusion sets.
    """
    errors = []
    # Tokenize preserving character indices
    token_matches = list(re.finditer(r"\b[a-zA-Z']+\b", text))
    tokens = [m.group(0) for m in token_matches]

    for i, match in enumerate(token_matches):
        word = match.group(0)
        word_lower = word.lower()

        for rule in CONFUSION_RULES:
            if word_lower in rule["set"]:
                result = rule["detect"](tokens, i)
                if result and result[2]:  # condition matched
                    replacement, explanation, _ = result
                    # Match casing
                    if word.isupper():
                        replacement = replacement.upper()
                    elif word[0].isupper():
                        replacement = replacement.capitalize()

                    errors.append({
                        "type": "CONFUSION_SET",
                        "category": "Context-Sensitive Spelling",
                        "original": word,
                        "suggestion": replacement,
                        "explanation": explanation,
                        "start": match.start(),
                        "end": match.end(),
                        "context": text[max(0, match.start() - 15):min(len(text), match.end() + 15)]
                    })
                    break

    return errors


if __name__ == "__main__":
    sample = "Their going to meet over there because its a beautiful day and they loose the game."
    print("Testing Confusion Set Checker:")
    print("Input:", sample)
    results = check_confusion_sets(sample)
    for err in results:
        print(f" - [{err['original']} -> {err['suggestion']}]: {err['explanation']} (index {err['start']}-{err['end']})")
