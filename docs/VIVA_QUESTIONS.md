# Top 30+ Viva Voce Questions & Answers for NLP Project Defense

This reference guide prepares students for academic viva questions on **Natural Language Processing (NLP)**, **Spelling Correction**, **Grammar Checking**, and **Computational Linguistics**.

---

### Q1: What is the primary objective of this project?
**Ans:** To design and implement a comprehensive natural language processing system that detects and corrects non-word spelling errors, context-sensitive real-word errors, syntactic agreement violations, and stylistic redundancies, while computing readability metrics.

---

### Q2: What is the difference between a Non-Word Error and a Real-Word Error?
**Ans:**
- **Non-Word Error:** The generated string is not present in the dictionary (e.g., *"recieve"*, *"definately"*). It is detected via lexicon lookup.
- **Real-Word Error:** The token is a valid dictionary entry, but erroneous in its context (e.g., *"their going"* instead of *"they're going"*, or *"loose the game"* instead of *"lose"*). It requires syntactic/N-gram context analysis.

---

### Q3: What is Minimum Edit Distance?
**Ans:** Minimum edit distance is the smallest number of insertion, deletion, and substitution operations needed to convert one string into another. In Damerau-Levenshtein, transposition of two adjacent characters is also included.

---

### Q4: Why do we use Dynamic Programming for Levenshtein Distance instead of recursion?
**Ans:** A naive recursive solution exhibits overlapping subproblems, leading to exponential $O(3^{m+n})$ time complexity. Dynamic Programming stores solutions to subproblems in a 2D table of size $(m+1) \times (n+1)$, reducing the time complexity to polynomial time $O(m \times n)$.

---

### Q5: How does Peter Norvig’s Bayesian Spelling Corrector work?
**Ans:** It applies Bayes' theorem to find $\arg\max_c P(c \mid w) = \arg\max_c [P(w \mid c) \cdot P(c)]$.
- $P(c)$ (Language Model): Prior probability of word $c$ based on corpus frequency.
- $P(w \mid c)$ (Error Model): Estimated using candidate generation within edit distance 1 or 2.

---

### Q6: What percentage of spelling errors fall within edit distance 1?
**Ans:** Studies by Fred Damerau (1964) and Eric Brill demonstrate that approximately **80% to 90%** of human typing mistakes are within edit distance 1 (a single insertion, deletion, substitution, or transposition).

---

### Q7: What is Damerau-Levenshtein distance, and how does it differ from standard Levenshtein?
**Ans:** Standard Levenshtein allows 3 operations: Insert, Delete, Substitute. Damerau-Levenshtein introduces a 4th operation: **Transposition** of two adjacent characters (e.g., *teh* $\rightarrow$ *the*). In standard Levenshtein, this costs 2 operations (delete + insert), whereas Damerau-Levenshtein counts it as 1 operation.

---

### Q8: What are "Confusion Sets"?
**Ans:** Confusion sets are predefined groups of words that are frequently confused due to identical or similar phonetics (homophones) or orthography (e.g., *{their, there, they're}*, *{its, it's}*, *{affect, effect}*, *{your, you're}*, *{then, than}*).

---

### Q9: How does the system handle Indefinite Article Agreement ("a" vs "an")?
**Ans:** The system enforces phonological rules: *"an"* is used before vowel sounds and *"a"* before consonant sounds. It explicitly handles exceptions where orthography and phonology diverge, such as silent 'h' (*"an hour"*) and palatal glide /j/ (*"a university"*, *"a European"*).

---

### Q10: How does the system check Subject-Verb Agreement (SVA)?
**Ans:** Using pattern-matching and POS tagging heuristics:
1. Third-person singular subjects (`he`, `she`, `it`, or singular noun phrases) must take singular verbs (e.g., *study* $\rightarrow$ *studies*).
2. Plural subjects (`they`, `we`, `you`) must take plural verbs and auxiliaries (`were`, `are`, `have`).

---

### Q11: How do you evaluate a Grammar & Spelling Checker?
**Ans:** Using standard Information Retrieval and Classification metrics:
- **Precision:** $\frac{\text{TP}}{\text{TP} + \text{FP}}$ (Proportion of flagged errors that are genuinely incorrect).
- **Recall:** $\frac{\text{TP}}{\text{TP} + \text{FN}}$ (Proportion of actual errors that the system successfully detected).
- **F1-Score:** Harmonic mean of precision and recall: $2 \times \frac{\text{Precision} \times \text{Recall}}{\text{Precision} + \text{Recall}}$.

---

### Q12: Why is high Precision often favored over high Recall in writing assistants?
**Ans:** False positives (annoying the user by flagging correct text as an error) degrade user trust much faster than occasionally missing a subtle error (false negative). Therefore, commercial tools like Grammarly calibrate their thresholds to maintain very high Precision.

---

### Q13: What is the Flesch Reading Ease score?
**Ans:** A metric developed by Rudolf Flesch calculating text readability based on average sentence length (words per sentence) and average word length (syllables per word). Scores range from 0 to 100, where higher scores indicate easier readability.

---

### Q14: What is Type-Token Ratio (TTR)?
**Ans:** It is a measure of lexical diversity and vocabulary richness, defined as:
$$\text{TTR} = \frac{\text{Number of Unique Words (Types)}}{\text{Total Number of Words (Tokens)}}$$

---

### Q15: What is the Noisy Channel Model in NLP?
**Ans:** It assumes that an intended clean message $c$ passed through a noisy channel (the keyboard / human typing errors), producing a corrupted message $w$. The goal of decoder/corrector is to reconstruct $c$ from $w$ using Bayesian probabilities.

---

### Q16: How are Syllables counted computationally in your system?
**Ans:** Using English phonological vowel grouping rules: consecutive vowel sequences (`aeiouy`) count as a single syllable, discounting trailing silent 'e' unless preceded by 'l' (e.g., *table*).

---

### Q17: What are the limitations of Rule-Based Grammar Checkers?
**Ans:**
1. Difficult to maintain when scaling to millions of complex grammatical exceptions.
2. Cannot capture deep semantic context or long-range dependencies across multiple clauses.
3. Rigid and may produce false alarms in creative or informal prose.

---

### Q18: How do Modern Deep Learning models approach Grammar Error Correction (GEC)?
**Ans:** Modern systems frame GEC as a **Sequence-to-Sequence (Seq2Seq)** translation task (translating from "ungrammatical English" to "grammatical English") using pre-trained Transformer architectures like **T5 (Text-to-Text Transfer Transformer)**, **BART**, or autoregressive LLMs.

---

### Q19: What is the time complexity of candidate generation in Norvig's algorithm?
**Ans:** For a word of length $L$ over alphabet size $V = 26$:
- Number of 1-edits: $L \text{ deletes} + (L-1) \text{ transpositions} + 26L \text{ replaces} + 26(L+1) \text{ inserts} \approx 54L + 25$.
- For an average word of length 7: $\sim 400$ variations for edit distance 1, and $\sim 100,000$ variations for edit distance 2.

---

### Q20: How does the system handle User Custom Dictionaries?
**Ans:** The system allows users to add domain-specific terminology or proper nouns (e.g., *“Atharva”*, *“Utkarsh”*, *“PyTorch”*), which are saved in `localStorage` in the browser or personal dictionary files in Python, preventing false typo warnings.

---

### Q21: What is a Tautology or Redundancy error?
**Ans:** Phrases containing unnecessary repetitive meaning, such as *"revert back"* (*revert* already means to return), *"end result"*, *"past history"*, or *"free gift"*.

---

### Q22: What role does Part-of-Speech (POS) tagging play in Grammar Checking?
**Ans:** POS tagging assigns grammatical categories (Noun, Verb, Adjective, etc.) to each token, enabling the rule engine to identify structural syntactic violations such as missing main verbs, determiner-noun mismatches, or adjectives misplaced after nouns.

---

### Q23: How does your Web App synchronize real-time highlight underlines with the textarea?
**Ans:** Using a dual-layer architectural pattern: a background `<div>` with identical dimensions, typography, and line-height renders `<mark>` tags with CSS wavy underlines, overlaid exactly behind a transparent `<textarea>` with synchronized scrolling.

---

### Q24: What is Soundex or Metaphone?
**Ans:** Phonetic hashing algorithms that index words by their pronunciation rather than spelling (e.g., *"Smith"* and *"Smyth"* have identical Soundex code `S530`). They help retrieve candidate corrections for phonetically misspelled words.

---

### Q25: Why did you provide both a Client-Side Web App and Python NLP Package?
**Ans:** To achieve the best of both worlds:
1. **Interactive Client-Side App:** Instant zero-latency execution in any browser with interactive Dynamic Programming matrix visualization and Grammarly-like UX.
2. **Python Package:** Rigorous modular scripts for command-line analysis, unit testing, and academic benchmarking against gold-standard corpora.
