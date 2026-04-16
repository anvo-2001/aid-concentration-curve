/**
 * chart.js — D3 concentration curve chart
 *
 * Exposes:  window.Chart.init(data, activeDonors)
 *           window.Chart.update(activeDonors)
 *
 * `data`         — array of row objects parsed from CSV
 * `activeDonors` — Set of donor ids currently toggled on
 */

(function () {
  'use strict';

  /* ── Layout constants ──────────────────────────────────────────────────────── */
  const M = { top: 18, right: 28, bottom: 52, left: 54 };

  /* ── Module state ──────────────────────────────────────────────────────────── */
  let _data = [];
  let _active = new Set();
  let _W = 0, _H = 0;

  /* ── D3 selections ─────────────────────────────────────────────────────────── */
  const svgEl   = document.getElementById('chart');
  const svg     = d3.select(svgEl);
  const g       = svg.append('g').attr('transform', `translate(${M.left},${M.top})`);

  const xScale  = d3.scaleLinear().domain([0, 1]);
  const yScale  = d3.scaleLinear().domain([0, 1]);

  const xAxisG  = g.append('g').attr('class', 'x-axis');
  const yAxisG  = g.append('g').attr('class', 'y-axis');
  const xGridG  = g.append('g').attr('class', 'x-grid').style('opacity', 0.6);
  const yGridG  = g.append('g').attr('class', 'y-grid').style('opacity', 0.6);
  const eqLine  = g.append('line').attr('class', 'eq-line');
  const pathsG  = g.append('g');
  const labelsG = g.append('g');
  const hoverG  = g.append('g');

  const hoverVline = hoverG.append('line')
    .attr('stroke', '#ccc').attr('stroke-width', 1)
    .attr('stroke-dasharray', '3,3').style('display', 'none');

  const hoverDot = hoverG.append('circle')
    .attr('r', 4.5).attr('stroke-width', 1.5)
    .attr('fill', 'white').style('display', 'none');

  /* Axis labels */
  g.append('text').attr('class', 'axis-label').attr('id', 'x-label')
    .attr('text-anchor', 'middle').text('Cumulative share of population');
  g.append('text').attr('class', 'axis-label').attr('id', 'y-label')
    .attr('text-anchor', 'middle').attr('transform', 'rotate(-90)')
    .text('Cumulative share of aid');

  /* Tooltip */
  const tooltip = document.getElementById('tooltip');

  /* ── Helpers ───────────────────────────────────────────────────────────────── */

  /**
   * Build a concentration curve for one donor field.
   * Countries sorted ascending by sdg_index (worst → best).
   * Returns array of { x, y, recipient, sdg, pop, aidUSD }
   */
  function buildCurve(sortedData, field) {
    const totalPop = d3.sum(sortedData, d => d._pop);
    const totalAid = d3.sum(sortedData, d => d[field] || 0);
    if (totalAid === 0) return [];

    let cumPop = 0, cumAid = 0;
    const pts = [{ x: 0, y: 0, recipient: null }];

    for (const row of sortedData) {
      cumPop += row._pop / totalPop;
      cumAid += (row[field] || 0) / totalAid;
      pts.push({
        x: cumPop,
        y: cumAid,
        recipient: row.recipient,
        sdg: row.sdg_index,
        pop: row._pop,
        aidUSD: row[field] || 0,
      });
    }
    return pts;
  }

  function linePath(pts) {
    return d3.line()
      .x(d => xScale(d.x))
      .y(d => yScale(d.y))(pts);
  }

  /* ── Draw axes ─────────────────────────────────────────────────────────────── */
  function drawAxes() {
    xAxisG
      .attr('transform', `translate(0,${_H})`)
      .call(d3.axisBottom(xScale).ticks(6).tickFormat(d3.format('.1f')));

    yAxisG
      .call(d3.axisLeft(yScale).ticks(6).tickFormat(d3.format('.1f')));

    xGridG
      .attr('transform', `translate(0,${_H})`)
      .call(d3.axisBottom(xScale).ticks(6).tickSize(-_H).tickFormat(''));

    yGridG
      .call(d3.axisLeft(yScale).ticks(6).tickSize(-_W).tickFormat(''));

    eqLine
      .attr('x1', xScale(0)).attr('y1', yScale(0))
      .attr('x2', xScale(1)).attr('y2', yScale(1));

    d3.select('#x-label')
      .attr('x', _W / 2)
      .attr('y', _H + 44);

    d3.select('#y-label')
      .attr('x', -(_H / 2))
      .attr('y', -42);
  }

  /* ── Draw paths ────────────────────────────────────────────────────────────── */
  function drawPaths() {
    const sorted = [..._data].sort((a, b) => a.sdg_index - b.sdg_index);

    const curveData = window.DONORS_CONFIG.map(d => ({
      ...d,
      pts: buildCurve(sorted, d.field),
    }));

    const paths = pathsG
      .selectAll('.conc-path')
      .data(curveData, d => d.id);

    paths.enter()
      .append('path')
      .attr('class', 'conc-path')
      .merge(paths)
      .attr('d', d => linePath(d.pts))
      .attr('stroke', d => d.color)
      .attr('stroke-dasharray', d => d.dash ? d.dash.join(',') : null)
      .classed('faded',  d => !_active.has(d.id))
      .classed('active', d =>  _active.has(d.id));

    paths.exit().remove();
  }

  /* ── Draw country labels for the first active donor ───────────────────────── */
  function drawLabels() {
    labelsG.selectAll('*').remove();

    const firstDonor = window.DONORS_CONFIG.find(d => _active.has(d.id));
    if (!firstDonor) return;

    const sorted = [..._data].sort((a, b) => a.sdg_index - b.sdg_index);
    const pts = buildCurve(sorted, firstDonor.field);
    const labeled = pts.filter(p => p.recipient && window.LABEL_COUNTRIES.has(p.recipient));

    labeled.forEach(p => {
      const px = xScale(p.x);
      const py = yScale(p.y);
      const offsets = window.LABEL_OFFSETS[p.recipient] || { dx: 6, dy: -8 };

      labelsG.append('circle')
        .attr('cx', px).attr('cy', py).attr('r', 2.8)
        .attr('fill', firstDonor.color).attr('opacity', 0.7);

      labelsG.append('text')
        .attr('class', 'country-label')
        .attr('x', px + offsets.dx)
        .attr('y', py + offsets.dy)
        .attr('fill', firstDonor.color)
        .attr('opacity', 0.85)
        .text(p.recipient);
    });
  }

  /* ── Hover overlay ─────────────────────────────────────────────────────────── */
  function setupHover() {
    g.selectAll('.hover-overlay').remove();

    const sorted = [..._data].sort((a, b) => a.sdg_index - b.sdg_index);

    /* Pre-build curves for all donors once */
    const curveMap = {};
    window.DONORS_CONFIG.forEach(d => {
      curveMap[d.id] = buildCurve(sorted, d.field);
    });

    g.append('rect')
      .attr('class', 'hover-overlay')
      .attr('width', _W)
      .attr('height', _H)
      .attr('fill', 'transparent')
      .on('mousemove', function (event) {
        const [mx] = d3.pointer(event);
        const xVal = xScale.invert(mx);

        /* Find nearest point along primary active donor */
        const primaryDonor = window.DONORS_CONFIG.find(d => _active.has(d.id));
        if (!primaryDonor) return;

        const pts = curveMap[primaryDonor.id];
        const bisect = d3.bisector(d => d.x).left;
        const idx = Math.min(bisect(pts, xVal, 1), pts.length - 1);
        const p = pts[idx];
        if (!p || !p.recipient) return;

        const px = xScale(p.x);
        const py = yScale(p.y);

        hoverVline.style('display', null)
          .attr('x1', px).attr('y1', _H)
          .attr('x2', px).attr('y2', py);

        hoverDot.style('display', null)
          .attr('cx', px).attr('cy', py)
          .attr('stroke', primaryDonor.color);

        /* Build tooltip rows for all active donors */
        const activeDonorRows = window.DONORS_CONFIG
          .filter(d => _active.has(d.id))
          .map(d => {
            const dpts = curveMap[d.id];
            const bi = d3.bisector(dp => dp.x).left;
            const di = Math.min(bi(dpts, xVal, 1), dpts.length - 1);
            const dp = dpts[di];
            const aidM = dp ? dp.aidUSD : 0;
            const aidFmt = aidM >= 1000
              ? `$${(aidM / 1000).toFixed(1)}B`
              : `$${aidM.toFixed(0)}M`;
            return `<div class="tooltip-row">
              <span class="tooltip-label" style="color:${d.color}">${d.label}</span>
              <span class="tooltip-val">${aidFmt}</span>
            </div>`;
          })
          .join('');

        const popM = (p.pop / 1e6).toFixed(1);
        tooltip.innerHTML = `
          <div class="tooltip-country">${p.recipient}</div>
          <div class="tooltip-meta">
            SDG index: <strong>${p.sdg ? p.sdg.toFixed(2) : '—'}</strong>
            &nbsp;·&nbsp; Pop: <strong>${popM}M</strong>
          </div>
          <hr class="tooltip-divider" />
          <div class="tooltip-head">Aid received (net ODA)</div>
          ${activeDonorRows}`;

        tooltip.style.display = 'block';
        const viewportW = window.innerWidth;
        let tx = event.clientX + 18;
        let ty = event.clientY - 32;
        if (tx + 290 > viewportW) tx = event.clientX - 300;
        if (ty < 8) ty = 8;
        tooltip.style.left  = tx + 'px';
        tooltip.style.top   = ty + 'px';
      })
      .on('mouseleave', () => {
        tooltip.style.display = 'none';
        hoverVline.style('display', 'none');
        hoverDot.style('display', 'none');
      });
  }

  /* ── Resize ────────────────────────────────────────────────────────────────── */
  function resize() {
    const container = document.getElementById('chart-container');
    _W = container.clientWidth - M.left - M.right;
    _H = Math.max(340, Math.min(540, _W * 0.72));

    svg
      .attr('width',  _W + M.left + M.right)
      .attr('height', _H + M.top  + M.bottom);

    xScale.range([0, _W]);
    yScale.range([_H, 0]);

    drawAxes();
    drawPaths();
    drawLabels();
    setupHover();
  }

  /* ── Public API ────────────────────────────────────────────────────────────── */
  window.Chart = {
    init(data, activeDonors) {
      _data   = data;
      _active = activeDonors;
      resize();
      window.addEventListener('resize', resize);
    },

    update(activeDonors) {
      _active = activeDonors;
      drawPaths();
      drawLabels();
    },
  };
})();
