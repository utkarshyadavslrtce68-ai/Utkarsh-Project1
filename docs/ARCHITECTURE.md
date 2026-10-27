# System Architecture: LexiCheck NLP Engine

This document details the modular system design, pipeline dataflow, and component interactions of the **LexiCheck NLP System**.

---

## 1. High-Level System Architecture

```
+-----------------------------------------------------------------------------------+
|                                 USER INTERFACES                                   |
|   +---------------------------------------+   +-------------------------------+   |
|   |  Interactive Web App (Grammarly-Style)|   |  Terminal CLI & REPL Tool     |   |
|   |  (HTML5 / Modern CSS / Vanilla JS)    |   |  (python python/cli.py)       |   |
|   +-------------------+-------------------+   +---------------+---------------+   |
+-----------------------|---------------------------------------|-------------------+
                        |                                       |
                        v                                       v
+-----------------------------------------------------------------------------------+
|                            NLP PIPELINE CONTROLLER                                |
|                        (NLPEngine / python/nlp_pipeline)                          |
+-----------------------------------------------------------------------------------+
       |                    |                     |                     |
       v                    v                     v                     v
+--------------+   +-----------------+   +------------------+   +-------------------+
|   Spelling   |   |  Confusion Sets |   |     Grammar      |   |    Readability    |
|  Corrector   |   |   (Contextual)  |   |   Rule Engine    |   |     Analytics     |
+--------------+   +-----------------+   +------------------+   +-------------------+
| * Levenshtein|   | * N-gram checks |   | * Subject-Verb   |   | * Flesch Reading  |
|   DP Matrix  |   | * Homophones    |   |   Agreement      |   |   Ease            |
| * Peter      |   | * Collocation   |   | * Article 'a/an' |   | * Grade Level     |
|   Norvig     |   |   disambiguation|   | * Double Neg.    |   | * Gunning Fog     |
|   Bayes P(c) |   | * Triggers      |   | * Redundancies   |   | * Lexical TTR     |
| * Damerau    |   |                 |   | * Contractions   |   | * Reading Time    |
|   Transpos.  |   |                 |   |                  |   |                   |
+--------------+   +-----------------+   +------------------+   +-------------------+
       |                    |                     |                     |
       +--------------------+----------+----------+---------------------+
                                       |
                                       v
+-----------------------------------------------------------------------------------+
|                             SYNTHESIS & REPORTING                                 |
|   * Span Annotation & Offset Alignment (Start, End)                              |
|   * Reverse Sequential In-Place Correction Algorithm                             |
|   * Dynamic Programming Alignment Table Visualization                            |
|   * Precision, Recall & F1 Evaluation Reports                                    |
+-----------------------------------------------------------------------------------+
```

---

## 2. Component Responsibility Matrix

| Component | File Path | Primary Algorithms / Techniques | Key Responsibilities |
|---|---|---|---|
| **Edit Distance** | `python/edit_distance.py`<br>`js/nlp-engine.js` | Dynamic Programming, Matrix Backtracing | Computes 2D alignment matrix, edit operations (Insert, Delete, Sub, Transpose). |
| **Bayesian Speller** | `python/norvig_spell.py`<br>`js/nlp-engine.js` | Bayes Theorem, Noisy Channel, Corpus Priors | Generates candidate corrections up to distance 2 and ranks by prior probability. |
| **Confusion Sets** | `python/confusion_sets.py`<br>`js/nlp-engine.js` | N-gram collocation, Positional Heuristics | Resolves real-word homophone errors (their/there/they're, its/it's). |
| **Grammar Engine** | `python/grammar_checker.py`<br>`js/nlp-engine.js` | Syntactic parsing, Morphological inflection | Enforces subject-verb agreement, article rules, double negative normalization. |
| **Readability** | `python/readability.py`<br>`js/nlp-engine.js` | Phonological vowel grouping, Flesch formula | Calculates Flesch ease, grade levels, reading time, and lexical diversity. |
| **Visualizer** | `js/visualizer.js`<br>`css/visualizer.css` | HTML Table rendering, CSS grid, SVG icons | Live interactive DP Matrix rendering with green glowing backtrace paths. |
| **REST API** | `python/api.py` | Python `http.server`, JSON, CORS | Zero-dependency microservice backend for remote text checking. |

---

## 3. Data Processing Pipeline Flow

1. **Input Ingestion:** Text string accepted via textarea or CLI argument.
2. **Text Normalization & Segmentation:** Text divided into sentences and token spans preserving character offsets $(start, end)$.
3. **Multi-Stage Error Detection:**
   - **Stage 1 (Grammar & Syntactic Rules):** Evaluates multi-word phrases (e.g., *"The scientist study"* or *"a apple"*).
   - **Stage 2 (Context-Sensitive Confusion Sets):** Scans for real-word errors within confusion groups.
   - **Stage 3 (Non-Word Spelling Typos):** Inspects remaining unflagged tokens against lexicon using Norvig candidate generation and Levenshtein distance.
4. **Readability & Metrics Analysis:** Calculates syllables, words per sentence, and Flesch score.
5. **Reverse Sequential Correction:** Replaces error spans in descending order of character start position to prevent index drift.
6. **Output Rendering:** Displays wavy underlines, suggestion cards, and analytics gauges in UI.
