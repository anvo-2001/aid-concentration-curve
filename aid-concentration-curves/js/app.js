/**
 * app.js — Bootstrap: load CSV → build controls → init chart
 *
 * Data flow:
 *   1. d3.csv('data/donors.csv') parses the supplementary data file
 *   2. Numeric columns are coerced to floats
 *   3. Controls are built from DONORS_CONFIG (js/config.js)
 *   4. Chart.init() is called; subsequent toggles call Chart.update()
 */

(function () {
  'use strict';

  /* Active donor set — start from defaultActive flags in config */
  const activeDonors = new Set(
    window.DONORS_CONFIG.filter(d => d.defaultActive).map(d => d.id)
  );

  /* ── Numeric columns to coerce ─────────────────────────────────────────────── */
  const NUMERIC_COLS = [
    'france', 'germany', 'japan', 'uk', 'us',
    'dac', 'eu', 'multilateral', 'non_dac', 'un', 'wb',
    'recipient_pop', 'sdg_index', 'total_pop', 'china', 'totaloda',
  ];

  /* ── Load CSV ──────────────────────────────────────────────────────────────── */
  d3.csv('data/donors.csv').then(rawRows => {

    /* Coerce types */
    const data = rawRows.map(row => {
      const out = { ...row };
      NUMERIC_COLS.forEach(col => {
        out[col] = row[col] === '' || row[col] == null
          ? null
          : +row[col];
      });
      /* Convenience: population in people (recipient_pop) */
      out._pop = out.recipient_pop || 0;
      return out;
    });

    /* ── Build donor toggle buttons ──────────────────────────────────────────── */
    const groupMap = {
      aggregates:   document.getElementById('controls-aggregates'),
      bilateral:    document.getElementById('controls-bilateral'),
      multilateral: document.getElementById('controls-multilateral'),
    };

    window.DONORS_CONFIG.forEach(donor => {
      const container = groupMap[donor.group];
      if (!container) return;

      const btn = document.createElement('button');
      btn.className = 'donor-btn' + (activeDonors.has(donor.id) ? ' active' : '');
      btn.textContent = donor.label;
      btn.dataset.id  = donor.id;

      /* Active background uses donor color */
      btn.style.setProperty('--donor-color', donor.color);
      if (activeDonors.has(donor.id)) {
        btn.style.background    = donor.color;
        btn.style.borderColor   = donor.color;
      }

      btn.addEventListener('click', () => {
        if (activeDonors.has(donor.id)) {
          if (activeDonors.size > 1) {
            activeDonors.delete(donor.id);
            btn.classList.remove('active');
            btn.style.background  = '';
            btn.style.borderColor = '';
          }
        } else {
          activeDonors.add(donor.id);
          btn.classList.add('active');
          btn.style.background  = donor.color;
          btn.style.borderColor = donor.color;
        }

        /* Sync legend faded state */
        document.querySelectorAll('.legend-item').forEach(li => {
          li.classList.toggle('faded', !activeDonors.has(li.dataset.id));
        });

        window.Chart.update(activeDonors);
      });

      container.appendChild(btn);
    });

    /* ── Build legend ────────────────────────────────────────────────────────── */
    const legendEl = document.getElementById('legend');
    window.DONORS_CONFIG.forEach(donor => {
      const item = document.createElement('div');
      item.className = 'legend-item' + (activeDonors.has(donor.id) ? '' : ' faded');
      item.dataset.id = donor.id;

      const swatch = document.createElement('div');
      swatch.className = 'legend-swatch';
      if (donor.dash) {
        /* Dashed swatch: use repeating-linear-gradient */
        const [on, off] = donor.dash;
        swatch.style.background = `repeating-linear-gradient(
          90deg,
          ${donor.color} 0px, ${donor.color} ${on}px,
          transparent ${on}px, transparent ${(on + (off || 4))}px
        )`;
      } else {
        swatch.style.background = donor.color;
      }

      const label = document.createElement('span');
      label.textContent = donor.label;

      item.appendChild(swatch);
      item.appendChild(label);

      /* Clicking legend mirrors button behavior */
      item.addEventListener('click', () => {
        const btn = document.querySelector(`.donor-btn[data-id="${donor.id}"]`);
        if (btn) btn.click();
      });

      legendEl.appendChild(item);
    });

    /* ── Suits table ─────────────────────────────────────────────────────────── */
    window.renderSuitsTable();

    /* ── Init chart ──────────────────────────────────────────────────────────── */
    window.Chart.init(data, activeDonors);

  }).catch(err => {
    console.error('Failed to load donors.csv:', err);
    document.getElementById('chart-container').innerHTML =
      `<p style="color:#b03020;padding:24px;font-family:sans-serif;">
        Could not load <code>data/donors.csv</code>. 
        If opening locally, serve from a local web server 
        (e.g. <code>npx serve .</code> or VS Code Live Server).
       </p>`;
  });

})();
