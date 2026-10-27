"""
Syntactic and Grammar Checking Engine (NLP Rule-Based & Pattern Rules)
Part of NLP Spelling and Grammar Checker Project.

Theoretical Foundation:
Grammar checking in computational linguistics evaluates sentences against prescriptive
and descriptive grammatical constraints:
1. Syntactic Agreement (Subject-Verb, Determiner-Noun number agreement)
2. Morphological inflection (third-person singular -s/-es, irregular past participles)
3. Phonological constraints (indefinite article allomorphs 'a' vs 'an')
4. Stylistic & Semantic constraints (double negatives, tautologies, passive voice)
"""

import re
from typing import List, Dict, Any, Tuple


class GrammarChecker:
    def __init__(self):
        # Pronoun & auxiliary tables
        self.singular_subjects = {"he", "she", "it", "this", "that", "the scientist", "the student", "the doctor"}
        self.plural_subjects = {"they", "we", "you", "these", "those", "the scientists", "the students"}

        # Irregular verb mappings: base -> third person singular
        self.base_to_singular = {
            "study": "studies", "go": "goes", "do": "does", "have": "has",
            "want": "wants", "need": "needs", "see": "sees", "know": "knows",
            "make": "makes", "take": "takes", "come": "comes", "think": "thinks",
            "look": "looks", "use": "uses", "find": "finds", "give": "gives",
            "tell": "tells", "work": "works", "call": "calls", "try": "tries",
            "ask": "asks", "feel": "feels", "become": "becomes", "leave": "leaves",
            "put": "puts", "mean": "means", "keep": "keeps", "let": "lets",
            "begin": "begins", "seem": "seems", "help": "helps", "talk": "talks",
            "turn": "turns", "start": "starts", "show": "shows", "hear": "hears",
            "play": "plays", "run": "runs", "move": "moves", "like": "likes",
            "live": "lives", "believe": "believes", "hold": "holds", "bring": "brings",
            "happen": "happens", "write": "writes", "provide": "provides", "sit": "sits",
            "stand": "stands", "lose": "loses", "pay": "pays", "meet": "meets",
            "include": "includes", "continue": "continues", "set": "sets", "learn": "learns",
            "change": "changes", "lead": "leads", "understand": "understands", "watch": "watches",
            "follow": "follows", "stop": "stops", "create": "creates", "speak": "speaks",
            "read": "reads", "allow": "allows", "add": "adds", "spend": "spends",
            "grow": "grows", "open": "opens", "walk": "walks", "win": "wins",
            "offer": "offers", "remember": "remembers", "love": "loves", "consider": "considers",
            "appear": "appears", "buy": "buys", "serve": "serves", "die": "dies",
            "send": "sends", "expect": "expects", "build": "builds", "stay": "stays",
            "fall": "falls", "cut": "cuts", "reach": "reaches", "kill": "kills",
            "remain": "remains"
        }

        # Redundancies dictionary (phrase -> clean replacement)
        self.redundancies = {
            r"\brevert back\b": ("reply", "Tautology: 'revert' already means to return or reply."),
            r"\bend result\b": ("result", "Redundant: a result is by definition at the end."),
            r"\bpast history\b": ("history", "Redundant: history by definition occurred in the past."),
            r"\bfree gift\b": ("gift", "Redundant: a gift is inherently free."),
            r"\bclose proximity\b": ("proximity", "Redundant: proximity means closeness."),
            r"\bcompletely eliminated?\b": ("eliminated", "Redundant: elimination is already absolute."),
            r"\bunexpected surprise\b": ("surprise", "Redundant: surprises are inherently unexpected."),
            r"\badvance planning\b": ("planning", "Redundant: planning always occurs in advance."),
            r"\bfirstly\b": ("first", "Stylistic preference: 'first' is preferable to 'firstly' in formal writing.")
        }

        # Missing apostrophe contractions
        self.contractions = {
            r"\bdont\b": "don't",
            r"\bcant\b": "can't",
            r"\bwont\b": "won't",
            r"\bdidnt\b": "didn't",
            r"\bdoesnt\b": "doesn't",
            r"\bisnt\b": "isn't",
            r"\barent\b": "aren't",
            r"\bwasnt\b": "wasn't",
            r"\bwerent\b": "weren't",
            r"\bhavent\b": "haven't",
            r"\bhasnt\b": "hasn't",
            r"\bhadnt\b": "hadn't",
            r"\bcouldnt\b": "couldn't",
            r"\bshouldnt\b": "shouldn't",
            r"\bwouldnt\b": "wouldn't"
        }

    def check(self, text: str) -> List[Dict[str, Any]]:
        """
        Executes comprehensive grammatical checks across input text.
        """
        issues = []
        issues.extend(self._check_articles(text))
        issues.extend(self._check_subject_verb_agreement(text))
        issues.extend(self._check_double_negatives(text))
        issues.extend(self._check_word_repetition(text))
        issues.extend(self._check_redundancies(text))
        issues.extend(self._check_contractions(text))
        issues.extend(self._check_capitalization(text))
        issues.extend(self._check_passive_voice(text))

        # Sort issues by start position
        issues.sort(key=lambda x: x["start"])
        return issues

    def _check_articles(self, text: str) -> List[Dict[str, Any]]:
        """
        Checks for indefinite article allomorph violations: 'a' vs 'an'.
        Rule: Use 'an' before vowel sounds, 'a' before consonant sounds.
        """
        issues = []
        
        # 'a' followed by vowel sound
        # Exceptions: university, unique, European, one, uniform (start with consonant glide /j/ or /w/)
        vowel_sound_regex = re.compile(
            r"\b(a)\s+((?!(?:uni|use|user|uk|eu|one|once)\b)[aeiou][a-z]*|honest|hour|honor)\b",
            re.IGNORECASE
        )
        for m in vowel_sound_regex.finditer(text):
            article = m.group(1)
            next_word = m.group(2)
            suggestion = "an" if article.islower() else "An"
            issues.append({
                "type": "GRAMMAR",
                "category": "Article Agreement",
                "original": f"{article} {next_word}",
                "suggestion": f"{suggestion} {next_word}",
                "explanation": f"Use '{suggestion}' before words beginning with a vowel sound.",
                "start": m.start(),
                "end": m.end()
            })

        # 'an' followed by consonant sound
        # Include words starting with 'u' pronounced as /ju/ (university, unique, etc.)
        consonant_sound_regex = re.compile(
            r"\b(an)\s+((?!(?:hour|honest|honor)\b)(?:[bcdfghjklmnpqrstvwxyz]|uni|unique|european|useful|uniform|universal)[a-z]*)\b",
            re.IGNORECASE
        )
        for m in consonant_sound_regex.finditer(text):
            article = m.group(1)
            next_word = m.group(2)
            suggestion = "a" if article.islower() else "A"
            issues.append({
                "type": "GRAMMAR",
                "category": "Article Agreement",
                "original": f"{article} {next_word}",
                "suggestion": f"{suggestion} {next_word}",
                "explanation": f"Use '{suggestion}' before words beginning with a consonant sound.",
                "start": m.start(),
                "end": m.end()
            })

        return issues

    def _check_subject_verb_agreement(self, text: str) -> List[Dict[str, Any]]:
        """
        Detects subject-verb agreement mismatches.
        """
        issues = []

        # 1. Singular 3rd person subject + base form verb (e.g., "He go" -> "He goes", "She study" -> "She studies")
        for subj in ["he", "she", "it"]:
            pattern = re.compile(rf"\b({subj})\s+([a-z]+)\b", re.IGNORECASE)
            for m in pattern.finditer(text):
                subject = m.group(1)
                verb = m.group(2).lower()

                # Irregular auxiliary mismatches
                if verb == "were":
                    issues.append({
                        "type": "GRAMMAR",
                        "category": "Subject-Verb Agreement",
                        "original": f"{subject} were",
                        "suggestion": f"{subject} was",
                        "explanation": f"Singular subject '{subject}' takes singular past auxiliary 'was'.",
                        "start": m.start(),
                        "end": m.end()
                    })
                elif verb == "have":
                    issues.append({
                        "type": "GRAMMAR",
                        "category": "Subject-Verb Agreement",
                        "original": f"{subject} have",
                        "suggestion": f"{subject} has",
                        "explanation": f"Third-person singular '{subject}' takes 'has'.",
                        "start": m.start(),
                        "end": m.end()
                    })
                elif verb == "are":
                    issues.append({
                        "type": "GRAMMAR",
                        "category": "Subject-Verb Agreement",
                        "original": f"{subject} are",
                        "suggestion": f"{subject} is",
                        "explanation": f"Third-person singular '{subject}' takes 'is'.",
                        "start": m.start(),
                        "end": m.end()
                    })
                elif verb in self.base_to_singular:
                    sing_verb = self.base_to_singular[verb]
                    issues.append({
                        "type": "GRAMMAR",
                        "category": "Subject-Verb Agreement",
                        "original": f"{subject} {m.group(2)}",
                        "suggestion": f"{subject} {sing_verb}",
                        "explanation": f"Third-person singular subject '{subject}' requires singular verb '{sing_verb}'.",
                        "start": m.start(),
                        "end": m.end()
                    })

        # 2. Plural subjects with singular verb ("They was", "We is", "They has")
        for subj in ["they", "we", "you"]:
            pattern = re.compile(rf"\b({subj})\s+(was|is|has)\b", re.IGNORECASE)
            for m in pattern.finditer(text):
                subject = m.group(1)
                verb = m.group(2).lower()
                repl = {"was": "were", "is": "are", "has": "have"}[verb]
                issues.append({
                    "type": "GRAMMAR",
                    "category": "Subject-Verb Agreement",
                    "original": f"{subject} {m.group(2)}",
                    "suggestion": f"{subject} {repl}",
                    "explanation": f"Plural subject '{subject}' takes plural auxiliary '{repl}'.",
                    "start": m.start(),
                    "end": m.end()
                })

        # 3. Noun phrase + base verb: "The scientist study" -> "The scientist studies"
        singular_noun_pattern = re.compile(r"\b(the\s+[a-z]+)\s+([a-z]+)\b", re.IGNORECASE)
        for m in singular_noun_pattern.finditer(text):
            np = m.group(1).lower()
            verb = m.group(2).lower()
            # If noun is singular (doesn't end with s) and verb is in base form
            noun_word = np.split()[-1]
            if not noun_word.endswith("s") and verb in self.base_to_singular:
                sing_verb = self.base_to_singular[verb]
                issues.append({
                    "type": "GRAMMAR",
                    "category": "Subject-Verb Agreement",
                    "original": f"{m.group(1)} {m.group(2)}",
                    "suggestion": f"{m.group(1)} {sing_verb}",
                    "explanation": f"Singular subject '{noun_word}' requires singular verb '{sing_verb}'.",
                    "start": m.start(),
                    "end": m.end()
                })

        return issues

    def _check_double_negatives(self, text: str) -> List[Dict[str, Any]]:
        """
        Detects non-standard double negatives.
        """
        issues = []
        dn_pattern = re.compile(
            r"\b(don't|dont|doesn't|doesnt|didn't|didnt|can't|cant|couldn't|couldnt|won't|wont)\s+(?:[a-z]+\s+)?(no|nothing|nobody|nowhere|neither)\b",
            re.IGNORECASE
        )
        repl_map = {"no": "any", "nothing": "anything", "nobody": "anybody", "nowhere": "anywhere", "neither": "either"}

        for m in dn_pattern.finditer(text):
            neg_word = m.group(2).lower()
            replacement = repl_map.get(neg_word, "any")
            issues.append({
                "type": "GRAMMAR",
                "category": "Double Negative",
                "original": m.group(0),
                "suggestion": f"{m.group(1)} {replacement}",
                "explanation": f"Avoid double negatives; replace '{neg_word}' with '{replacement}'.",
                "start": m.start(),
                "end": m.end()
            })
        return issues

    def _check_word_repetition(self, text: str) -> List[Dict[str, Any]]:
        """
        Detects accidental consecutive repeated words (e.g., 'the the', 'is is').
        """
        issues = []
        rep_pattern = re.compile(r"\b([a-zA-Z]+)\s+\1\b", re.IGNORECASE)
        for m in rep_pattern.finditer(text):
            word = m.group(1)
            # Allow legitimate repetitions like 'had had' or 'that that'
            if word.lower() in ["had", "that"]:
                continue
            issues.append({
                "type": "GRAMMAR",
                "category": "Repeated Word",
                "original": m.group(0),
                "suggestion": word,
                "explanation": f"Duplicate word '{word}' detected.",
                "start": m.start(),
                "end": m.end()
            })
        return issues

    def _check_redundancies(self, text: str) -> List[Dict[str, Any]]:
        """
        Detects pleonasms and wordy tautologies.
        """
        issues = []
        for pattern_str, (repl, explanation) in self.redundancies.items():
            pattern = re.compile(pattern_str, re.IGNORECASE)
            for m in pattern.finditer(text):
                issues.append({
                    "type": "STYLE",
                    "category": "Redundancy",
                    "original": m.group(0),
                    "suggestion": repl,
                    "explanation": explanation,
                    "start": m.start(),
                    "end": m.end()
                })
        return issues

    def _check_contractions(self, text: str) -> List[Dict[str, Any]]:
        """
        Detects contractions written without apostrophes.
        """
        issues = []
        for pattern_str, repl in self.contractions.items():
            pattern = re.compile(pattern_str, re.IGNORECASE)
            for m in pattern.finditer(text):
                matched = m.group(0)
                formatted_repl = repl.capitalize() if matched[0].isupper() else repl
                issues.append({
                    "type": "SPELLING",
                    "category": "Missing Apostrophe",
                    "original": matched,
                    "suggestion": formatted_repl,
                    "explanation": f"Missing apostrophe in contraction '{formatted_repl}'.",
                    "start": m.start(),
                    "end": m.end()
                })
        return issues

    def _check_capitalization(self, text: str) -> List[Dict[str, Any]]:
        """
        Detects lowercase letters at the beginning of sentences.
        """
        issues = []
        # Match beginning of text or character after sentence end punctuation [.?!] followed by whitespace
        pattern = re.compile(r"(?:^|[.?!]\s+)([a-z])")
        for m in pattern.finditer(text):
            char = m.group(1)
            pos = m.start(1)
            issues.append({
                "type": "GRAMMAR",
                "category": "Capitalization",
                "original": char,
                "suggestion": char.upper(),
                "explanation": "Sentences should begin with an uppercase letter.",
                "start": pos,
                "end": pos + 1
            })
        return issues

    def _check_passive_voice(self, text: str) -> List[Dict[str, Any]]:
        """
        Flags passive voice constructions for stylistic consideration.
        """
        issues = []
        passive_regex = re.compile(
            r"\b(is|are|was|were|been|being)\s+([a-z]+ed|[a-z]+en)\s+by\b",
            re.IGNORECASE
        )
        for m in passive_regex.finditer(text):
            issues.append({
                "type": "STYLE",
                "category": "Passive Voice",
                "original": m.group(0),
                "suggestion": "Consider active voice",
                "explanation": f"Passive construction '{m.group(0)}'. Active voice is often clearer and more direct.",
                "start": m.start(),
                "end": m.end()
            })
        return issues


if __name__ == "__main__":
    checker = GrammarChecker()
    sample = "she go to school. She bought a apple and an laptop. We don't need no help. Please revert back."
    print("Testing GrammarChecker:")
    for issue in checker.check(sample):
        print(f"[{issue['category']}] '{issue['original']}' -> '{issue['suggestion']}': {issue['explanation']}")
