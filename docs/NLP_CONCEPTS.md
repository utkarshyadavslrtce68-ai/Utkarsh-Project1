# Natural Language Processing (NLP) Concepts & Theoretical Foundations

This document provides complete theoretical documentation for the **LexiCheck NLP Spelling and Grammar Checking System**, suitable for academic project reports, viva voce examinations, and engineering presentations.

---

## 1. Problem Definition in Computational Linguistics

Spelling and grammatical error detection can be broadly categorized into three distinct NLP subproblems:

1. **Non-Word Error Detection (Isolated Typo Correction):**  
   The token does not exist in the vocabulary lexicon (e.g., *"recieve"* instead of *"receive"*).
2. **Real-Word Error Detection (Context-Sensitive Spelling):**  
   The token exists in the lexicon, but is syntactically or semantically invalid in context (e.g., *"Their going to school"* instead of *"They're going"*).
3. **Syntactic & Grammatical Error Detection:**  
   The tokens violate grammatical rules such as subject-verb agreement (*"He go"*), determiner-noun collocation (*"a apple"*), double negatives, or run-on sentences.

---

## 2. Minimum Edit Distance (Levenshtein Distance)

### 2.1 Theoretical Formulation
Given a source string $S$ of length $m$ and a target string $T$ of length $n$, the Levenshtein distance is defined as the minimum number of single-character edit operations required to transform $S$ into $T$.

Allowed elementary operations:
- **Insertion** (cost $c_{\text{ins}} = 1$)
- **Deletion** (cost $c_{\text{del}} = 1$)
- **Substitution** (cost $c_{\text{sub}} = 1$ if characters differ, $0$ if identical)

### 2.2 Dynamic Programming Recurrence Relation
Let $D[i, j]$ denote the minimum edit distance between prefix $S[1 \dots i]$ and prefix $T[1 \dots j]$:

$$
D[i, j] = \min \begin{cases}
D[i-1, j] + 1 & \text{(Deletion of } S[i]\text{)} \\
D[i, j-1] + 1 & \text{(Insertion of } T[j]\text{)} \\
D[i-1, j-1] + \text{cost}(S[i], T[j]) & \text{(Substitution / Match)}
\end{cases}
$$

Base cases:
- $D[i, 0] = i \quad \forall \ i \in [0, m]$ (deleting all characters to match empty string)
- $D[0, j] = j \quad \forall \ j \in [0, n]$ (inserting all characters from empty string)

### 2.3 Optimal Backtracking Path
To recover the exact sequence of edit operations:
1. Start at cell $D[m, n]$.
2. Trace backwards to $(i-1, j)$, $(i, j-1)$, or $(i-1, j-1)$ depending on which neighbor generated the minimum value.
3. Terminate when reaching $(0, 0)$.

### 2.4 Complexity Analysis
- **Time Complexity:** $O(m \times n)$
- **Space Complexity:** $O(m \times n)$ (reducible to $O(\min(m, n))$ if only distance is required without backtrace).

---

## 3. Peter Norvig's Bayesian Language Model

### 3.1 The Noisy Channel Formulation
Given an observed (possibly misspelled) word $w$, the objective is to find the candidate word $c^*$ that maximizes the posterior probability:

$$
c^* = \arg\max_{c \in V} P(c \mid w)
$$

Applying Bayes' Theorem:

$$
P(c \mid w) = \frac{P(w \mid c) \cdot P(c)}{P(w)}
$$

Since $P(w)$ is constant across all candidate words $c$, this simplifies to:

$$
c^* = \arg\max_{c \in V} \big[ P(w \mid c) \cdot P(c) \big]
$$

### 3.2 Components of the Model:
1. **$P(c)$ — The Language Model (Prior Probability):**
   Estimates the likelihood of candidate word $c$ appearing in standard natural language:
   $$P(c) = \frac{\text{Count}(c)}{N}$$
   where $N$ is the total token count of the training corpus.
2. **$P(w \mid c)$ — The Error Model (Likelihood / Noisy Channel):**
   The probability that a writer typed $w$ when intending $c$. In Norvig's formulation, this is parameterized by edit distance:
   - Edit distance 0: $P(w \mid c)$ is highest (exact match).
   - Edit distance 1: Deletion, transposition, substitution, or insertion. According to empirical studies by Damerau (1964), ~80% of human misspellings are within edit distance 1.
   - Edit distance 2: Compound errors.

---

## 4. Rule-Based Syntactic & Morphological Analysis

### 4.1 Subject-Verb Agreement (SVA)
In English syntax, third-person singular subjects take verbs ending in *-s* or *-es* in the simple present tense:
- Singular subject pronoun: `He`, `She`, `It` $\rightarrow$ requires singular inflected verb (e.g., *studies*, *goes*, *writes*).
- Singular noun phrase: `The scientist` + `study` $\rightarrow$ detected violation; correction: `studies`.
- Auxiliary mismatches: `They was` $\rightarrow$ `They were`; `He were` $\rightarrow$ `He was`.

### 4.2 Indefinite Article Allomorphy
The choice between *a* and *an* is phonologically conditioned:
- **Rule:** Use *an* before vowel sounds (/æ/, /ɛ/, /ɪ/, /ɒ/, /ʌ/, /aɪ/, etc.); use *a* before consonant sounds.
- **Glides:** Words like *university*, *European*, *unique* begin with the palatal glide /j/, which acts phonologically as a consonant $\rightarrow$ *"a university"*.
- **Silent 'h':** Words like *hour*, *honest*, *honor* begin with a vowel sound $\rightarrow$ *"an hour"*.

### 4.3 Double Negatives
Standard English employs single negative concord. When an auxiliary is negated (*don't*, *can't*, *won't*), an indeterminate polarity item (*any*, *anything*, *anybody*) is required rather than a second negative (*no*, *nothing*, *nobody*).

---

## 5. Readability & Linguistic Quality Metrics

### 5.1 Flesch Reading Ease Formula
Quantifies structural accessibility on a 0–100 scale:

$$
\text{Score} = 206.835 - 1.015 \left( \frac{\text{total words}}{\text{total sentences}} \right) - 84.6 \left( \frac{\text{total syllables}}{\text{total words}} \right)
$$

- $90 - 100$: Very Easy (5th grade reading level)
- $60 - 70$: Standard (8th–9th grade reading level, plain English)
- $0 - 30$: Very Difficult (College graduate level)

### 5.2 Flesch-Kincaid Grade Level
Translates score directly into US school grade levels:

$$
\text{Grade Level} = 0.39 \left( \frac{\text{total words}}{\text{total sentences}} \right) + 11.8 \left( \frac{\text{total syllables}}{\text{total words}} \right) - 15.59
$$

### 5.3 Lexical Diversity (Type-Token Ratio - TTR)
Measures vocabulary richness:

$$
\text{TTR} = \frac{\text{Unique Word Tokens}}{\text{Total Word Count}}
$$
