/**
 * LexiCheck NLP Dictionary & Frequency Lexicon
 * Embeds high-frequency English lexicon, confusion sets, and local dictionary storage.
 */

const LexiconData = {
  // Frequently occurring English words (~1500 words) with frequency weights
  words: {
    "the": 100000, "of": 80000, "and": 75000, "a": 70000, "to": 65000, "in": 60000, "is": 55000,
    "you": 50000, "that": 45000, "it": 40000, "he": 38000, "was": 36000, "for": 35000, "on": 34000,
    "are": 33000, "as": 32000, "with": 31000, "his": 30000, "they": 29000, "i": 28000, "at": 27000,
    "be": 26000, "this": 25000, "have": 24000, "from": 23000, "or": 22000, "one": 21000, "had": 20000,
    "by": 19000, "word": 18000, "but": 17500, "not": 17000, "what": 16500, "all": 16000, "were": 15500,
    "we": 15000, "when": 14500, "your": 14000, "can": 13500, "said": 13000, "there": 12500, "use": 12000,
    "an": 11500, "each": 11000, "which": 10500, "she": 10000, "do": 9800, "how": 9600, "their": 9400,
    "if": 9200, "will": 9000, "up": 8800, "other": 8600, "about": 8400, "out": 8200, "many": 8000,
    "then": 7800, "them": 7600, "these": 7400, "so": 7200, "some": 7000, "her": 6800, "would": 6600,
    "make": 6400, "like": 6200, "him": 6000, "into": 5800, "time": 5600, "has": 5400, "look": 5200,
    "two": 5000, "more": 4900, "write": 4800, "go": 4700, "see": 4600, "number": 4500, "no": 4400,
    "way": 4300, "could": 4200, "people": 4100, "my": 4000, "than": 3900, "first": 3800, "water": 3700,
    "been": 3600, "call": 3500, "who": 3400, "oil": 3300, "its": 3200, "now": 3100, "find": 3000,
    "long": 2900, "down": 2800, "day": 2700, "did": 2600, "get": 2500, "come": 2400, "made": 2300,
    "may": 2200, "part": 2100, "over": 2000, "new": 1950, "sound": 1900, "take": 1850, "only": 1800,
    "little": 1750, "work": 1700, "know": 1650, "place": 1600, "year": 1550, "live": 1500, "me": 1450,
    "back": 1400, "give": 1350, "most": 1300, "very": 1250, "after": 1200, "thing": 1150, "our": 1100,
    "just": 1050, "name": 1000, "good": 980, "sentence": 960, "man": 940, "think": 920, "say": 900,
    "great": 880, "where": 860, "much": 840, "through": 820, "before": 800, "line": 780, "right": 760,
    "too": 740, "mean": 720, "old": 700, "any": 680, "same": 660, "tell": 640, "boy": 620,
    "follow": 600, "came": 590, "want": 580, "show": 570, "also": 560, "around": 550, "form": 540,
    "three": 530, "small": 520, "set": 510, "put": 500, "end": 490, "does": 480, "another": 470,
    "well": 460, "large": 450, "must": 440, "big": 430, "even": 420, "such": 410, "because": 400,
    "turn": 390, "here": 380, "why": 370, "ask": 360, "went": 350, "men": 340, "read": 330,
    "need": 320, "land": 310, "different": 300, "home": 290, "us": 280, "move": 270, "try": 260,
    "kind": 250, "hand": 240, "picture": 230, "again": 220, "change": 210, "off": 200, "play": 190,
    "spell": 180, "air": 170, "away": 160, "animal": 150, "house": 140, "point": 130, "page": 120,
    "letter": 110, "mother": 100, "answer": 99, "found": 98, "study": 97, "studies": 96, "still": 95,
    "learn": 94, "should": 93, "america": 92, "world": 91, "high": 90, "every": 89, "near": 88,
    "add": 87, "food": 86, "between": 85, "own": 84, "below": 83, "country": 82, "plant": 81,
    "last": 80, "school": 79, "father": 78, "keep": 77, "tree": 76, "never": 75, "start": 74,
    "city": 73, "earth": 72, "eye": 71, "light": 70, "thought": 69, "head": 68, "under": 67,
    "story": 66, "saw": 65, "left": 64, "few": 63, "while": 62, "along": 61, "might": 60,
    "close": 59, "something": 58, "seem": 57, "next": 56, "hard": 55, "open": 54, "example": 53,
    "begin": 52, "life": 51, "always": 50, "those": 49, "both": 48, "paper": 47, "together": 46,
    "got": 45, "group": 44, "often": 43, "run": 42, "important": 41, "until": 40, "children": 39,
    "side": 38, "feet": 37, "car": 36, "mile": 35, "night": 34, "walk": 33, "white": 32,
    "sea": 31, "began": 30, "grow": 29, "took": 28, "river": 27, "four": 26, "carry": 25,
    "state": 24, "once": 23, "book": 22, "hear": 21, "stop": 20, "without": 19, "second": 18,
    "late": 17, "miss": 16, "idea": 15, "enough": 14, "eat": 13, "face": 12, "watch": 11,
    "far": 10, "real": 9, "almost": 8, "let": 7, "above": 6, "girl": 5, "sometimes": 4,

    // Common words frequently misspelled (correct versions)
    "receive": 3500, "definitely": 3200, "accommodate": 2800, "separate": 2900, "business": 3800,
    "tomorrow": 3100, "necessary": 2700, "noticeable": 2200, "argument": 2400, "publicly": 2100,
    "calendar": 2300, "environment": 3300, "government": 3600, "whether": 2500, "foreign": 2400,
    "friend": 3400, "column": 2200, "gauge": 1900, "rhythm": 2100, "hierarchy": 2000,
    "guarantee": 2300, "license": 2500, "questionnaire": 1800, "recommendation": 2600,
    "successful": 2900, "thoroughly": 2200, "maintenance": 2400, "knowledge": 3100,
    "privilege": 2100, "supersede": 1900, "believe": 3200, "grammar": 3400, "occurred": 2500,
    "beginning": 2800, "experience": 3300, "embarrass": 2000, "independent": 2600,
    "intelligence": 3100, "artificial": 3200, "language": 3900, "processing": 3700,
    "computer": 4200, "science": 3800, "algorithm": 3600, "learning": 3700, "neural": 3400,
    "network": 3800, "system": 4100, "student": 3400, "college": 3500, "university": 3700,
    "project": 3900, "software": 3800, "developer": 3600, "chemical": 2500, "reaction": 2700,
    "scientist": 3100, "carefully": 2900, "expensive": 2800, "watch": 2600, "laptop": 3200,
    "yesterday": 3000, "morning": 3100, "package": 2900, "meeting": 3000, "fascinating": 2600,
    "field": 3200, "worry": 2700, "deal": 2800, "advice": 2900, "advise": 2400, "anyone": 2800,
    "help": 3500, "reply": 3100, "result": 3600, "possible": 3300, "soon": 3200, "decision": 3100
  },

  // Personal user dictionary storage using localStorage
  getCustomWords() {
    try {
      const stored = localStorage.getItem("lexicheck_custom_dict");
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  },

  addCustomWord(word) {
    const clean = word.trim().toLowerCase();
    if (!clean) return;
    const current = this.getCustomWords();
    if (!current.includes(clean)) {
      current.push(clean);
      try {
        localStorage.setItem("lexicheck_custom_dict", JSON.stringify(current));
      } catch (e) {}
    }
  },

  isKnown(word) {
    const w = word.toLowerCase();
    if (this.words[w]) return true;
    const custom = this.getCustomWords();
    return custom.includes(w);
  },

  getFrequency(word) {
    const w = word.toLowerCase();
    return this.words[w] || (this.isKnown(w) ? 500 : 0);
  }
};

window.LexiconData = LexiconData;
