/**
 * config.js — Donor definitions and display configuration
 *
 * To add or remove donors:
 *   1. Add/remove an entry in window.DONORS_CONFIG
 *   2. Make sure the `field` matches a column name in data/donors.csv
 *   3. Reload the page — no build step needed
 *
 * To change which countries get labeled on the chart, edit LABEL_COUNTRIES.
 *
 * Dash patterns follow SVG stroke-dasharray syntax: [on, off, ...]
 * Set dash: null for a solid line.
 */

window.DONORS_CONFIG = [
  // ── Aggregates ────────────────────────────────────────────────────────────────
  {
    id: 'totaloda',
    label: 'Official donors + China',
    field: 'totaloda',        // CSV column name
    group: 'aggregates',
    color: '#c0392b',
    dash: null,
    defaultActive: true,
    suits: { index: -0.293, se: 0.156, pval: 0.060, rank: null },
  },
  {
    id: 'dac',
    label: 'DAC donors',
    field: 'dac',
    group: 'aggregates',
    color: '#2c4a7c',
    dash: [6, 4],
    defaultActive: true,
    suits: { index: -0.268, se: 0.145, pval: 0.064, rank: null },
  },
  {
    id: 'non_dac',
    label: 'Non-DAC donors',
    field: 'non_dac',
    group: 'aggregates',
    color: '#27ae60',
    dash: [3, 4],
    defaultActive: true,
    suits: { index: -0.372, se: 0.288, pval: 0.196, rank: null },
  },

  // ── Bilateral ─────────────────────────────────────────────────────────────────
  {
    id: 'uk',
    label: 'United Kingdom',
    field: 'uk',
    group: 'bilateral',
    color: '#1a6b8a',
    dash: null,
    defaultActive: false,
    suits: { index: -0.555, se: 0.168, pval: 0.001, rank: 2 },
  },
  {
    id: 'us',
    label: 'United States',
    field: 'us',
    group: 'bilateral',
    color: '#c06010',
    dash: null,
    defaultActive: false,
    suits: { index: -0.392, se: 0.178, pval: 0.028, rank: 4 },
  },
  {
    id: 'france',
    label: 'France',
    field: 'france',
    group: 'bilateral',
    color: '#8b1a6b',
    dash: [6, 3],
    defaultActive: false,
    suits: { index: -0.105, se: 0.158, pval: 0.506, rank: 7 },
  },
  {
    id: 'germany',
    label: 'Germany',
    field: 'germany',
    group: 'bilateral',
    color: '#5a5a3a',
    dash: [3, 3],
    defaultActive: false,
    suits: { index: -0.090, se: 0.123, pval: 0.467, rank: 8 },
  },
  {
    id: 'japan',
    label: 'Japan',
    field: 'japan',
    group: 'bilateral',
    color: '#6b1a1a',
    dash: [8, 3, 2, 3],
    defaultActive: false,
    suits: { index: -0.137, se: 0.146, pval: 0.350, rank: 5 },
  },
  {
    id: 'china',
    label: 'China (donor)',
    field: 'china',
    group: 'bilateral',
    color: '#b87333',
    dash: [4, 4],
    defaultActive: false,
    suits: { index: -0.115, se: 0.195, pval: 0.555, rank: 6 },
  },

  // ── Multilateral ──────────────────────────────────────────────────────────────
  {
    id: 'wb',
    label: 'World Bank (IDA)',
    field: 'wb',
    group: 'multilateral',
    color: '#1a5c4a',
    dash: null,
    defaultActive: false,
    suits: { index: -0.576, se: 0.165, pval: 0.000, rank: 1 },
  },
  {
    id: 'un',
    label: 'United Nations',
    field: 'un',
    group: 'multilateral',
    color: '#2c5c8c',
    dash: [5, 3],
    defaultActive: false,
    suits: { index: -0.512, se: 0.159, pval: 0.001, rank: 3 },
  },
  {
    id: 'eu',
    label: 'EU Institutions',
    field: 'eu',
    group: 'multilateral',
    color: '#8c6a10',
    dash: [3, 3],
    defaultActive: false,
    suits: { index: 0.126, se: 0.201, pval: 0.530, rank: 9 },
  },
];

/**
 * Countries to annotate on the chart.
 * Uses the `recipient` column value from the CSV exactly.
 * Add/remove names freely — chart auto-positions labels.
 */
window.LABEL_COUNTRIES = new Set([
  'Afghanistan',
  'Yemen',
  'Ethiopia',
  'Bangladesh',
  'India',
  'Egypt',
  'China',
  'Ukraine',
  'Syria',
  'Jordan',
  'Nigeria',
  'Pakistan',
]);

/**
 * Label offset overrides for specific countries.
 * Keys must match `recipient` column values.
 * { dx, dy } in pixels relative to the data point dot.
 */
window.LABEL_OFFSETS = {
  'India':       { dx: -36, dy: 12 },
  'China':       { dx:   5, dy:  9 },
  'Ukraine':     { dx:   5, dy: -9 },
  'Afghanistan': { dx:   4, dy: 12 },
  'Bangladesh':  { dx:   5, dy: -9 },
  'Ethiopia':    { dx:   5, dy: -9 },
};
