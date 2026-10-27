# 📝 LexiCheck NLP: Advanced Spelling and Grammar Checking System

[![NLP](https://img.shields.io/badge/Domain-Natural%20Language%20Processing-indigo.svg)](#)
[![Python](https://img.shields.io/badge/Python-3.8%2B-blue.svg)](#)
[![Zero-Dependency](https://img.shields.io/badge/Dependencies-Zero%20(Pure%20Stdlib)-emerald.svg)](#)
[![UI](https://img.shields.io/badge/Web%20App-Grammarly--Style%20Interactive-purple.svg)](#)
[![License](https://img.shields.io/badge/License-MIT-orange.svg)](#)

An end-to-end, academic and industry-grade **Spelling and Grammar Checking System** developed in Natural Language Processing (NLP). 

Featuring an **interactive Grammarly-style web application** running client-side with real-time wavy underlines and visual Dynamic Programming matrix inspection, alongside a **modular Python NLP suite** for terminal CLI, REST API, unit tests, and gold-standard benchmark evaluations.

---

## 🌟 Key Features

### 1. 🔍 Spelling Correction Engine
- **Minimum Edit Distance (Levenshtein & Damerau-Levenshtein):** Dynamic Programming 2D sequence alignment matrix with backtracking edit operations (*Insert, Delete, Substitute, Transpose*).
- **Peter Norvig's Bayesian Language Model:** Maximum a posteriori candidate selection using corpus prior probability $P(c)$ and edit distance noisy-channel likelihood $P(w \mid c)$.
- **Custom Dictionary Support:** Add domain terminology and personal names directly into local storage.

### 2. ⚡ Syntactic & Grammatical Rules Engine
- **Subject-Verb Agreement (SVA):** Detects singular third-person mismatches (*"He go"* $\rightarrow$ *"He goes"*, *"The scientist study"* $\rightarrow$ *"studies"*) and plural mismatches (*"They was"* $\rightarrow$ *"They were"*).
- **Indefinite Article Agreement (*a* vs *an*):** Enforces phonological vowel/consonant sound rules, handling silent 'h' (*"an hour"*) and palatal glides (*"a university"*).
- **Double Negatives:** Flags non-standard polarity items (*"don't need no"* $\rightarrow$ *"don't need any"*).
- **Tautology & Redundancy:** Cleans wordy phrases (*"revert back"* $\rightarrow$ *"reply"*, *"end result"* $\rightarrow$ *"result"*, *"past history"* $\rightarrow$ *"history"*).
- **Punctuation & Contraction Check:** Identifies missing apostrophes (*"dont"* $\rightarrow$ *"don't"*) and lowercase sentence starts.

### 3. 🎯 Context-Sensitive Spelling (Confusion Sets)
- Resolves real-word homophone errors using N-gram context heuristics:
  - *their* vs *there* vs *they're*
  - *its* vs *it's*
  - *your* vs *you're*
  - *affect* vs *effect*
  - *loose* vs *lose*
  - *then* vs *than*
  - *accept* vs *except*

### 4. 📊 Linguistic & Readability Analytics
- **Flesch Reading Ease Score (0–100)** with real-time visual gauge.
- **Flesch-Kincaid US School Grade Level**.
- **Lexical Diversity (Type-Token Ratio - TTR)** measuring vocabulary richness.
- **Estimated Reading Time** calculation based on average human reading speeds.

### 5. 🎨 Interactive NLP Algorithm Visualizer Studio
- **Dynamic Programming Matrix Visualizer:** Live interactive 2D grid displaying alignment scores with the optimal backtrace path highlighted in emerald green.
- **Bayesian Candidate Inspector:** Visualizes top candidate corrections with corpus frequency bars.
- **Part-of-Speech (POS) Tagger:** Color-coded token chips (Noun, Verb, Adjective, Pronoun, Preposition).

---

## 🚀 Quick Start Guide

### Option A: Launch the Interactive Web Application (Instant)
Simply open [`index.html`](index.html) in any web browser (Chrome, Edge, Firefox, Safari) or serve with any static web server:
```sh
# Double click index.html or open via browser
# Alternatively, using Python's built-in static server:
python -m http.server 3000
# Then visit: http://localhost:3000 in your browser!
```

---

### Option B: Run Python CLI & REPL Tool
Run the unified command-line tool with zero third-party pip dependencies:

```sh
# 1. Check an inline sentence:
python python/cli.py --text "She go to school and recieved a apple yesterday. Their going home."

# 2. Analyze a text file:
python python/cli.py --file data/corpus.txt

# 3. Inspect Levenshtein Dynamic Programming Alignment Table:
python python/cli.py --matrix "recieve" "receive"

# 4. Interactive REPL Mode:
python python/cli.py --interactive
```

---

### Option C: Run Zero-Dependency HTTP REST API
Launch the Python backend microservice:
```sh
python python/api.py 8000
```
**API Endpoints:**
- `POST http://127.0.0.1:8000/api/check` — Payload: `{"text": "your sentence"}` $\rightarrow$ Returns structured issues, metrics & corrections JSON.
- `GET http://127.0.0.1:8000/api/matrix?w1=recieve&w2=receive` $\rightarrow$ Returns 2D DP matrix & operations.
- `GET http://127.0.0.1:8000/api/health` $\rightarrow$ System health status.

---

### Option D: Run Benchmark Evaluation & Unit Tests
```sh
# Run gold-standard Precision/Recall/F1 benchmark:
python python/evaluate.py

# Run unit tests:
python -m unittest discover -s python/tests -p "test_*.py"
```

---

## 📁 Project Architecture & File Organization

```
Spelling and Grammar Checking/
├── index.html                   # Grammarly-style Web Application & Visualizer
├── css/
│   ├── style.css                # Glassmorphic UI, wavy underlines, responsive layout
│   └── visualizer.css           # 2D DP table styling, Norvig charts, POS badges
├── js/
│   ├── dictionary.js            # Lexicon vocabulary, frequencies & localStorage dict
│   ├── nlp-engine.js            # Client-side DP matrix, Norvig Bayes, POS & grammar rules
│   ├── visualizer.js            # Table rendering, candidate bars & POS tag badges
│   └── app.js                   # Application controller, debounced sync, one-click fixes
├── python/                      # Modular Python NLP Engine (Zero Dependencies)
│   ├── __init__.py              # Package init
│   ├── edit_distance.py         # Levenshtein & Damerau-Levenshtein with DP backtracing
│   ├── norvig_spell.py          # Peter Norvig's Bayesian probabilistic spell corrector
│   ├── grammar_checker.py       # Rule-based syntactic & agreement grammar checker
│   ├── confusion_sets.py        # Real-word context-sensitive spelling detector
│   ├── readability.py           # Flesch-Kincaid & lexical diversity metrics
│   ├── nlp_pipeline.py          # Unified pipeline orchestrator
│   ├── cli.py                   # Rich CLI tool and interactive REPL
│   ├── api.py                   # Python standard library HTTP JSON REST API
│   ├── evaluate.py              # Precision, Recall & F1 benchmark script
│   └── tests/
│       ├── test_spell.py        # Unit tests for edit distance & spell checking
│       └── test_grammar.py      # Unit tests for grammar & confusion sets
├── data/
│   ├── corpus.txt               # NLP training and frequency reference corpus
│   └── test_sentences.json      # Gold-standard benchmark sentences with annotations
├── docs/
│   ├── NLP_CONCEPTS.md          # Theoretical notes: DP recurrence, Bayes rule, Big-O
│   ├── VIVA_QUESTIONS.md        # 30+ Viva Voce questions & model answers for project defense
│   └── ARCHITECTURE.md          # Detailed pipeline architecture & data flow diagrams
└── README.md                    # Master project documentation
```

---

## 🔬 Theoretical Foundations & Formulas

### 1. Levenshtein Dynamic Programming Recurrence
$$
D[i, j] = \min \begin{cases}
D[i-1, j] + 1 & \text{(Deletion)} \\
D[i, j-1] + 1 & \text{(Insertion)} \\
D[i-1, j-1] + \text{cost}(S[i], T[j]) & \text{(Substitution / Match)}
\end{cases}
$$

### 2. Peter Norvig's Bayesian Formulation
$$
c^* = \arg\max_{c \in V} P(c \mid w) = \arg\max_{c \in V} \big[ P(w \mid c) \cdot P(c) \big]
$$

### 3. Flesch Reading Ease Formula
$$
\text{Score} = 206.835 - 1.015 \left( \frac{\text{total words}}{\text{total sentences}} \right) - 84.6 \left( \frac{\text{total syllables}}{\text{total words}} \right)
$$

---

## 🎓 Academic Defense & Viva Voce
Consult [`docs/VIVA_QUESTIONS.md`](docs/VIVA_QUESTIONS.md) for 30+ frequently asked viva examination questions and answers covering:
- Non-word vs real-word error disambiguation
- Damerau transposition significance
- Time & Space complexities ($O(M \times N)$)
- Precision vs Recall tradeoffs in commercial grammar assistants
- Comparison between Rule-Based NLP, Statistical Models, and Deep Learning Transformers (T5/BART).

---

## 📄 License
This project is open-source under the MIT License.
