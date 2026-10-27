/**
 * LexiCheck Application Controller
 * Handles editor input, real-time underlines, suggestion cards, and tab navigation.
 */

document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements
  const editorInput = document.getElementById("editorInput");
  const editorHighlights = document.getElementById("editorHighlights");
  const suggestionsContainer = document.getElementById("suggestionsContainer");
  const totalIssuesCount = document.getElementById("totalIssuesCount");
  const spellingCountBadge = document.getElementById("spellingCountBadge");
  const grammarCountBadge = document.getElementById("grammarCountBadge");
  const styleCountBadge = document.getElementById("styleCountBadge");
  
  // Readability Score Elements
  const fleschScoreEl = document.getElementById("fleschScore");
  const fleschLabelEl = document.getElementById("fleschLabel");
  const gradeLevelEl = document.getElementById("gradeLevel");
  const wordCountEl = document.getElementById("wordCount");
  const readingTimeEl = document.getElementById("readingTime");
  const lexicalDiversityEl = document.getElementById("lexicalDiversity");
  const scoreGaugeBar = document.getElementById("scoreGaugeBar");

  // Visualizer Inputs
  const matrixSourceInput = document.getElementById("matrixSourceInput");
  const matrixTargetInput = document.getElementById("matrixTargetInput");
  const btnComputeMatrix = document.getElementById("btnComputeMatrix");
  const matrixContainer = document.getElementById("matrixContainer");
  const norvigWordInput = document.getElementById("norvigWordInput");
  const btnInspectNorvig = document.getElementById("btnInspectNorvig");
  const norvigContainer = document.getElementById("norvigContainer");
  const posSentenceInput = document.getElementById("posSentenceInput");
  const btnInspectPOS = document.getElementById("btnInspectPOS");
  const posContainer = document.getElementById("posContainer");

  // Actions
  const btnAutoFixAll = document.getElementById("btnAutoFixAll");
  const btnCopyCorrected = document.getElementById("btnCopyCorrected");
  const btnExportTxt = document.getElementById("btnExportTxt");
  const btnClearText = document.getElementById("btnClearText");
  const presetSelector = document.getElementById("presetSelector");
  const themeToggle = document.getElementById("themeToggle");

  let currentAnalysis = null;
  let debounceTimer = null;

  // Preset texts
  const PRESETS = {
    "college": "The scientist study the chemical reaction carefully. She bought a expensive watch and an laptop yesterday. I am definately going to recieve the package tomorow morning. Their going to meet over there because its a beautiful day. We don't need no help with advance planning, but please revert back with the end result.",
    "business": "Please revert back as soon as possible with the end result. We dont want to loose our competitive edge. The team have completed the first draft, and each member know their responsibility.",
    "academic": "Natural language processing is is an interdisciplinary field combining computational linguistics with statistical models. Deep neural architectures has shown remarkable performance in grammatical error correction.",
    "clean": "The quick brown fox jumps over the lazy dog. Clear and precise writing enhances communication across all academic disciplines."
  };

  // -------------------------------------------------------------
  // Real-time Text Analysis
  // -------------------------------------------------------------
  function analyzeText() {
    const text = editorInput.value;
    currentAnalysis = window.NLPEngine.analyze(text);
    renderHighlights(text, currentAnalysis.issues);
    renderSuggestionCards(currentAnalysis.issues);
    renderMetrics(currentAnalysis.metrics, currentAnalysis.issues);
  }

  function debouncedAnalyze() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(analyzeText, 150);
  }

  editorInput.addEventListener("input", () => {
    debouncedAnalyze();
    syncScroll();
  });

  editorInput.addEventListener("scroll", syncScroll);

  function syncScroll() {
    if (editorHighlights) {
      editorHighlights.scrollTop = editorInput.scrollTop;
      editorHighlights.scrollLeft = editorInput.scrollLeft;
    }
  }

  // -------------------------------------------------------------
  // Render Editor Highlights (Underlines)
  // -------------------------------------------------------------
  function renderHighlights(text, issues) {
    if (!editorHighlights) return;
    if (!text) {
      editorHighlights.innerHTML = "";
      return;
    }

    let html = "";
    let lastIndex = 0;

    issues.forEach((issue, idx) => {
      // Unmarked segment before issue
      if (issue.start > lastIndex) {
        html += escapeHtml(text.substring(lastIndex, issue.start));
      }

      // Flagged segment with wavy underline class
      const marked = escapeHtml(text.substring(issue.start, issue.end));
      let typeClass = "hl-spelling";
      if (issue.type === "GRAMMAR") typeClass = "hl-grammar";
      else if (issue.type === "STYLE" || issue.type === "CONFUSION_SET") typeClass = "hl-style";

      html += `<mark class="hl-error ${typeClass}" data-issue-index="${idx}" title="${escapeHtml(issue.explanation)}">${marked}</mark>`;
      lastIndex = issue.end;
    });

    if (lastIndex < text.length) {
      html += escapeHtml(text.substring(lastIndex));
    }

    // Ensure trailing newline is accounted for in highlight backdrop
    if (text.endsWith("\n")) html += "\n";

    editorHighlights.innerHTML = html;

    // Attach click listeners on highlights to jump to card
    editorHighlights.querySelectorAll(".hl-error").forEach(el => {
      el.addEventListener("click", () => {
        const idx = el.getAttribute("data-issue-index");
        const card = document.getElementById(`issue-card-${idx}`);
        if (card) {
          card.scrollIntoView({ behavior: "smooth", block: "center" });
          card.classList.add("highlight-pulse");
          setTimeout(() => card.classList.remove("highlight-pulse"), 1200);
        }
      });
    });
  }

  // -------------------------------------------------------------
  // Render Suggestion Cards (Right Pane)
  // -------------------------------------------------------------
  function renderSuggestionCards(issues) {
    if (!suggestionsContainer) return;

    if (!issues || issues.length === 0) {
      suggestionsContainer.innerHTML = `
        <div class="all-clear-card">
          <div class="clear-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </div>
          <h3>Excellent Writing!</h3>
          <p>No spelling or grammatical issues detected in your text.</p>
        </div>
      `;
      return;
    }

    let html = "";
    issues.forEach((issue, idx) => {
      let badgeLabel = "Spelling";
      let badgeClass = "badge-spelling";
      if (issue.type === "GRAMMAR") {
        badgeLabel = "Grammar";
        badgeClass = "badge-grammar";
      } else if (issue.type === "CONFUSION_SET") {
        badgeLabel = "Context Word";
        badgeClass = "badge-confusion";
      } else if (issue.type === "STYLE") {
        badgeLabel = "Style / Wordiness";
        badgeClass = "badge-style";
      }

      html += `
        <div class="issue-card" id="issue-card-${idx}">
          <div class="card-header">
            <span class="category-badge ${badgeClass}">${badgeLabel}</span>
            <span class="rule-name">${issue.category}</span>
          </div>

          <div class="correction-row">
            <span class="original-text">${escapeHtml(issue.original)}</span>
            <span class="arrow-icon">&rarr;</span>
            <button class="btn-suggestion" data-index="${idx}" title="Click to apply correction">
              ${escapeHtml(issue.suggestion)}
            </button>
          </div>

          <p class="issue-explanation">${escapeHtml(issue.explanation)}</p>

          <div class="card-footer">
            <button class="btn-card-action btn-ignore" data-index="${idx}">Ignore</button>
            ${issue.type === "SPELLING" ? `
              <button class="btn-card-action btn-add-dict" data-word="${escapeHtml(issue.original)}">
                Add to Dictionary
              </button>
            ` : ""}
            <button class="btn-card-action btn-inspect-nlp" data-original="${escapeHtml(issue.original)}" data-suggestion="${escapeHtml(issue.suggestion)}">
              Inspect in Matrix &rarr;
            </button>
          </div>
        </div>
      `;
    });

    suggestionsContainer.innerHTML = html;

    // Attach Action Listeners
    suggestionsContainer.querySelectorAll(".btn-suggestion").forEach(btn => {
      btn.addEventListener("click", () => {
        const idx = parseInt(btn.getAttribute("data-index"), 10);
        applySingleCorrection(idx);
      });
    });

    suggestionsContainer.querySelectorAll(".btn-ignore").forEach(btn => {
      btn.addEventListener("click", () => {
        const idx = parseInt(btn.getAttribute("data-index"), 10);
        ignoreIssue(idx);
      });
    });

    suggestionsContainer.querySelectorAll(".btn-add-dict").forEach(btn => {
      btn.addEventListener("click", () => {
        const word = btn.getAttribute("data-word");
        window.LexiconData.addCustomWord(word);
        analyzeText();
      });
    });

    suggestionsContainer.querySelectorAll(".btn-inspect-nlp").forEach(btn => {
      btn.addEventListener("click", () => {
        const orig = btn.getAttribute("data-original");
        const sugg = btn.getAttribute("data-suggestion");
        // Switch to Visualizer Tab and populate matrix
        switchTab("visualizer");
        if (matrixSourceInput) matrixSourceInput.value = orig;
        if (matrixTargetInput) matrixTargetInput.value = sugg;
        window.NLPVisualizer.renderMatrix(orig, sugg, "matrixContainer");
      });
    });
  }

  // -------------------------------------------------------------
  // Corrections Manipulation
  // -------------------------------------------------------------
  function applySingleCorrection(issueIndex) {
    if (!currentAnalysis || !currentAnalysis.issues[issueIndex]) return;
    const issue = currentAnalysis.issues[issueIndex];
    const text = editorInput.value;

    const newText = text.substring(0, issue.start) + issue.suggestion + text.substring(issue.end);
    editorInput.value = newText;
    analyzeText();
  }

  function ignoreIssue(issueIndex) {
    if (!currentAnalysis || !currentAnalysis.issues[issueIndex]) return;
    currentAnalysis.issues.splice(issueIndex, 1);
    renderHighlights(editorInput.value, currentAnalysis.issues);
    renderSuggestionCards(currentAnalysis.issues);
    renderMetrics(currentAnalysis.metrics, currentAnalysis.issues);
  }

  function autoFixAll() {
    if (!currentAnalysis || currentAnalysis.issues.length === 0) return;
    editorInput.value = currentAnalysis.correctedText;
    analyzeText();
  }

  // -------------------------------------------------------------
  // Render Readability & Statistics
  // -------------------------------------------------------------
  function renderMetrics(metrics, issues) {
    const totalIssues = issues.length;
    const spellingCount = issues.filter(i => i.type === "SPELLING").length;
    const grammarCount = issues.filter(i => i.type === "GRAMMAR").length;
    const styleCount = issues.filter(i => i.type === "STYLE" || i.type === "CONFUSION_SET").length;

    if (totalIssuesCount) totalIssuesCount.textContent = totalIssues;
    if (spellingCountBadge) spellingCountBadge.textContent = spellingCount;
    if (grammarCountBadge) grammarCountBadge.textContent = grammarCount;
    if (styleCountBadge) styleCountBadge.textContent = styleCount;

    if (fleschScoreEl) fleschScoreEl.textContent = metrics.fleschEase;
    if (fleschLabelEl) fleschLabelEl.textContent = metrics.label;
    if (gradeLevelEl) gradeLevelEl.textContent = `Grade ${metrics.fleschGrade}`;
    if (wordCountEl) wordCountEl.textContent = `${metrics.wordCount} words / ${metrics.sentenceCount} sent.`;
    if (readingTimeEl) readingTimeEl.textContent = `${metrics.readingTimeSec}s reading time`;
    if (lexicalDiversityEl) lexicalDiversityEl.textContent = `${Math.round(metrics.lexicalDiversity * 100)}% TTR`;

    if (scoreGaugeBar) {
      scoreGaugeBar.style.width = `${Math.min(100, metrics.fleschEase)}%`;
      if (metrics.fleschEase >= 70) {
        scoreGaugeBar.style.backgroundColor = "var(--color-success)";
      } else if (metrics.fleschEase >= 45) {
        scoreGaugeBar.style.backgroundColor = "var(--color-warning)";
      } else {
        scoreGaugeBar.style.backgroundColor = "var(--color-danger)";
      }
    }
  }

  // -------------------------------------------------------------
  // Tab Switching
  // -------------------------------------------------------------
  window.switchTab = function(tabName) {
    document.querySelectorAll(".tab-content").forEach(el => el.classList.remove("active"));
    document.querySelectorAll(".nav-tab-btn").forEach(el => el.classList.remove("active"));

    const targetTab = document.getElementById(`tab-${tabName}`);
    const targetBtn = document.getElementById(`tabBtn-${tabName}`);
    if (targetTab) targetTab.classList.add("active");
    if (targetBtn) targetBtn.classList.add("active");

    if (tabName === "visualizer") {
      // Trigger initial matrix render if inputs present
      if (matrixSourceInput && matrixTargetInput && matrixSourceInput.value && matrixTargetInput.value) {
        window.NLPVisualizer.renderMatrix(matrixSourceInput.value, matrixTargetInput.value, "matrixContainer");
      }
    }
  };

  document.querySelectorAll(".nav-tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const tab = btn.getAttribute("data-tab");
      switchTab(tab);
    });
  });

  // -------------------------------------------------------------
  // Visualizer Event Listeners
  // -------------------------------------------------------------
  if (btnComputeMatrix) {
    btnComputeMatrix.addEventListener("click", () => {
      const s = matrixSourceInput.value.trim();
      const t = matrixTargetInput.value.trim();
      window.NLPVisualizer.renderMatrix(s, t, "matrixContainer");
    });
  }

  if (btnInspectNorvig) {
    btnInspectNorvig.addEventListener("click", () => {
      const w = norvigWordInput.value.trim();
      window.NLPVisualizer.renderNorvigCandidates(w, "norvigContainer");
    });
  }

  if (btnInspectPOS) {
    btnInspectPOS.addEventListener("click", () => {
      const s = posSentenceInput.value.trim();
      window.NLPVisualizer.renderPOSTags(s, "posContainer");
    });
  }

  // -------------------------------------------------------------
  // Toolbar Buttons
  // -------------------------------------------------------------
  if (btnAutoFixAll) {
    btnAutoFixAll.addEventListener("click", autoFixAll);
  }

  if (btnClearText) {
    btnClearText.addEventListener("click", () => {
      editorInput.value = "";
      analyzeText();
    });
  }

  if (btnCopyCorrected) {
    btnCopyCorrected.addEventListener("click", () => {
      const corrected = currentAnalysis ? currentAnalysis.correctedText : editorInput.value;
      navigator.clipboard.writeText(corrected).then(() => {
        const origText = btnCopyCorrected.textContent;
        btnCopyCorrected.textContent = "Copied!";
        setTimeout(() => btnCopyCorrected.textContent = origText, 1500);
      });
    });
  }

  if (btnExportTxt) {
    btnExportTxt.addEventListener("click", () => {
      const textToExport = currentAnalysis ? currentAnalysis.correctedText : editorInput.value;
      const blob = new Blob([textToExport], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "corrected_document.txt";
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  if (presetSelector) {
    presetSelector.addEventListener("change", (e) => {
      const val = e.target.value;
      if (PRESETS[val]) {
        editorInput.value = PRESETS[val];
        analyzeText();
      }
    });
  }

  // -------------------------------------------------------------
  // Dark / Light Theme Toggle
  // -------------------------------------------------------------
  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const currentTheme = document.documentElement.getAttribute("data-theme");
      const nextTheme = currentTheme === "light" ? "dark" : "light";
      document.documentElement.setAttribute("data-theme", nextTheme);
      localStorage.setItem("lexicheck_theme", nextTheme);
    });

    const savedTheme = localStorage.getItem("lexicheck_theme") || "dark";
    document.documentElement.setAttribute("data-theme", savedTheme);
  }

  // Initial Load with College Sample Text
  if (editorInput) {
    editorInput.value = PRESETS["college"];
    analyzeText();
  }

  // Initialize visualizer tabs defaults
  if (matrixSourceInput) matrixSourceInput.value = "recieve";
  if (matrixTargetInput) matrixTargetInput.value = "receive";
  if (norvigWordInput) norvigWordInput.value = "definately";
  if (posSentenceInput) posSentenceInput.value = "The scientist study the chemical reaction carefully.";
});

function escapeHtml(str) {
  if (!str) return "";
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
