/**
 * LexiCheck Visualizer Module
 * Dynamic Programming Alignment Table, Norvig Candidate Inspector, and POS Badges
 */

const NLPVisualizer = {
  renderMatrix(source, target, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!source || !target) {
      container.innerHTML = `<div class="empty-state">Enter both a source and target word to render the Dynamic Programming matrix.</div>`;
      return;
    }

    const { distance, matrix, operations } = window.NLPEngine.computeLevenshteinMatrix(source, target);

    // Identify which cells belong to the optimal backtrack path
    const pathCoords = new Set();
    let curI = 0;
    let curJ = 0;
    pathCoords.add(`0,0`);
    for (const op of operations) {
      if (op.type === "MATCH" || op.type === "SUBSTITUTE") {
        curI++;
        curJ++;
      } else if (op.type === "DELETE") {
        curI++;
      } else if (op.type === "INSERT") {
        curJ++;
      }
      pathCoords.add(`${curI},${curJ}`);
    }

    // Build HTML Table
    let html = `
      <div class="matrix-header-info">
        <div class="stat-badge">Levenshtein Distance: <strong>${distance}</strong></div>
        <div class="stat-badge">Source: <em>"${source}"</em> (${source.length} chars)</div>
        <div class="stat-badge">Target: <em>"${target}"</em> (${target.length} chars)</div>
      </div>
      <div class="table-scroll-wrapper">
        <table class="dp-matrix-table">
          <thead>
            <tr>
              <th class="matrix-corner">D[i,j]</th>
              <th class="matrix-col-header">#</th>
    `;

    for (let j = 0; j < target.length; j++) {
      html += `<th class="matrix-col-header">${target[j]}</th>`;
    }
    html += `</tr></thead><tbody>`;

    for (let i = 0; i <= source.length; i++) {
      const rowLabel = i === 0 ? "#" : source[i - 1];
      html += `<tr><th class="matrix-row-header">${rowLabel}</th>`;
      for (let j = 0; j <= target.length; j++) {
        const isPath = pathCoords.has(`${i},${j}`);
        const val = matrix[i][j];
        html += `<td class="matrix-cell ${isPath ? 'path-cell' : ''}" title="D[${i},${j}] = ${val}">${val}</td>`;
      }
      html += `</tr>`;
    }

    html += `</tbody></table></div>`;

    // Render operations list
    html += `<div class="operations-breakdown">
      <h4>Optimal Alignment Operations (Backtraced Path)</h4>
      <div class="op-chips-container">
    `;

    operations.forEach((op, idx) => {
      let badgeClass = "op-match";
      let text = `Match '${op.sourceChar}'`;
      if (op.type === "SUBSTITUTE") {
        badgeClass = "op-substitute";
        text = `Sub '${op.sourceChar}' &rarr; '${op.targetChar}'`;
      } else if (op.type === "DELETE") {
        badgeClass = "op-delete";
        text = `Del '${op.sourceChar}'`;
      } else if (op.type === "INSERT") {
        badgeClass = "op-insert";
        text = `Ins '${op.targetChar}'`;
      }
      html += `<span class="op-chip ${badgeClass}">Step ${idx + 1}: ${text}</span>`;
    });

    html += `</div></div>`;
    container.innerHTML = html;
  },

  renderNorvigCandidates(word, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!word) {
      container.innerHTML = `<div class="empty-state">Enter a query word to inspect candidate probability rankings.</div>`;
      return;
    }

    const candidates = window.NLPEngine.getSpellingCandidates(word);
    if (candidates.length === 0) {
      container.innerHTML = `<div class="empty-state">No candidate corrections found for "${word}" within edit distance 2.</div>`;
      return;
    }

    const maxFreq = Math.max(...candidates.map(c => c.frequency), 1);

    let html = `
      <div class="candidates-list">
        <h4>Bayesian Candidate Corrections for "<em>${word}</em>":</h4>
        <div class="candidate-cards">
    `;

    candidates.forEach((cand, idx) => {
      const pct = Math.min(100, Math.round((cand.frequency / maxFreq) * 100));
      html += `
        <div class="candidate-bar-row">
          <div class="cand-info">
            <span class="cand-rank">#${idx + 1}</span>
            <strong class="cand-name">${cand.word}</strong>
            <span class="cand-dist">Edit Distance: ${cand.editDistance}</span>
            <span class="cand-freq">Corpus Frequency: ${cand.frequency.toLocaleString()}</span>
          </div>
          <div class="cand-progress-bg">
            <div class="cand-progress-fill" style="width: ${pct}%"></div>
          </div>
        </div>
      `;
    });

    html += `</div></div>`;
    container.innerHTML = html;
  },

  renderPOSTags(sentence, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!sentence || !sentence.trim()) {
      container.innerHTML = `<div class="empty-state">Enter text to inspect Part-Of-Speech (POS) tags.</div>`;
      return;
    }

    const tagged = window.NLPEngine.tagPartsOfSpeech(sentence);
    let html = `<div class="pos-tokens-container">`;

    tagged.forEach(item => {
      html += `
        <div class="pos-token-card tag-${item.tag.toLowerCase()}">
          <span class="pos-word">${item.token}</span>
          <span class="pos-tag">${item.tag}</span>
        </div>
      `;
    });

    html += `</div>`;
    container.innerHTML = html;
  }
};

window.NLPVisualizer = NLPVisualizer;
