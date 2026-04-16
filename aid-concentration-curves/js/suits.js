/**
 * suits.js — Renders the Suits Index summary table
 *
 * Called once after data loads. Reads from DONORS_CONFIG.
 */

window.renderSuitsTable = function () {
  const tbody = document.getElementById('suits-tbody');
  if (!tbody) return;

  // Only donors with a rank (individual donors, not aggregates)
  const ranked = window.DONORS_CONFIG
    .filter(d => d.suits.rank !== null)
    .sort((a, b) => a.suits.rank - b.suits.rank);

  ranked.forEach(d => {
    const s = d.suits;
    const isNeg = s.index < 0;
    const barPct = Math.min(100, Math.abs(s.index) / 0.576 * 100).toFixed(1);

    const stars =
      s.pval < 0.001 ? '***' :
      s.pval < 0.01  ? '**'  :
      s.pval < 0.05  ? '*'   : '';

    const pvalFmt = s.pval < 0.001 ? '<0.001' : s.pval.toFixed(3);

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>
        <span style="display:inline-block;width:10px;height:10px;border-radius:2px;
          background:${d.color};margin-right:7px;vertical-align:middle;
          ${d.dash ? `background:none;border-top:2px dashed ${d.color};height:0;margin-top:5px;` : ''}
        "></span>
        ${d.label}
      </td>
      <td class="num">
        ${s.index.toFixed(3)}${stars ? `<span class="sig-star">${stars}</span>` : ''}
      </td>
      <td class="num">${s.se.toFixed(3)}</td>
      <td class="num">${pvalFmt}</td>
      <td class="${isNeg ? 'dir-prog' : 'dir-regr'}">${isNeg ? 'Progressive' : 'Regressive'}</td>
      <td class="bar-col">
        <div class="bar-bg">
          <div class="bar-fill ${isNeg ? 'bar-prog' : 'bar-regr'}" style="width:${barPct}%"></div>
        </div>
      </td>
      <td class="num">${s.rank}</td>`;
    tbody.appendChild(tr);
  });
};
