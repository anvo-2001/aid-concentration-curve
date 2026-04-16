# Aid Concentration Curves

Interactive visualisation of aid alignment with the UN Sustainable Development Goals,
companion to **Baulch & Feeny (2026) — "Aid and Progress Towards the Sustainable Development Goals"**.

**Live demo:** `https://<your-github-username>.github.io/aid-concentration-curves/`

---

## What it shows

Aid concentration curves plot the cumulative share of a donor's aid (y-axis) against the
cumulative share of recipient-country population (x-axis), with countries ranked
**left-to-right from worst to best SDG progress index score**.

- A curve **above** the diagonal = progressive (more aid to worse-SDG countries)
- A curve **below** the diagonal = regressive
- A curve **on** the diagonal = perfectly aligned with the SDG index

The Suits Index table summarises each donor's progressivity as a single number
(negative = progressive, positive = regressive, zero = perfectly aligned).

---

## Repository structure

```
aid-concentration-curves/
├── index.html              Main page
├── css/
│   └── style.css           All styling
├── js/
│   ├── config.js           ← EDIT THIS to add/remove donors or labels
│   ├── chart.js            D3 concentration curve chart
│   ├── suits.js            Suits index table renderer
│   └── app.js              Bootstrap: loads CSV, wires controls
├── data/
│   └── donors.csv          ← REPLACE THIS to update data
└── .github/
    └── workflows/
        └── deploy.yml      Auto-deploy to GitHub Pages on push
```

---

## Updating the data

1. Replace `data/donors.csv` with your updated file.
2. The CSV must preserve the same column names — specifically:
   - `recipient` — country name (string)
   - `sdg_index` — SDG progress index score (float, 0–100)
   - `recipient_pop` — mid-year population (integer)
   - `totaloda`, `dac`, `non_dac` — aggregate donor aid (USD millions)
   - `france`, `germany`, `japan`, `uk`, `us`, `china` — bilateral donors
   - `eu`, `un`, `wb` — multilateral donors
3. Commit and push — GitHub Actions deploys automatically.
4. No build step. No npm install.

### Adding a new donor column

1. Add the column to `donors.csv`.
2. Add an entry to `window.DONORS_CONFIG` in `js/config.js`:

```js
{
  id: 'new_donor',          // unique identifier
  label: 'New Donor',       // display name
  field: 'new_donor',       // must match CSV column name exactly
  group: 'bilateral',       // 'aggregates' | 'bilateral' | 'multilateral'
  color: '#2c7a4b',         // any CSS colour
  dash: null,               // null = solid; [on, off, ...] = dashed
  defaultActive: false,     // show on first load?
  suits: {                  // from your statistical output
    index: -0.210,
    se:     0.145,
    pval:   0.042,
    rank:   3,              // null if not individually ranked
  },
},
```

3. Optionally add the donor's country label offset to `window.LABEL_OFFSETS`.
4. Push — done.

---

## Running locally

Because the page loads `data/donors.csv` via `fetch`, you need a local web server
(browsers block file:// XHR requests by default).

**Option A — Node.js**
```bash
npx serve .
# → http://localhost:3000
```

**Option B — Python**
```bash
python3 -m http.server 8000
# → http://localhost:8000
```

**Option C — VS Code**
Install the *Live Server* extension, right-click `index.html` → *Open with Live Server*.

---

## Deploying to GitHub Pages

1. Create a new GitHub repository.
2. Push this folder:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/<username>/<repo>.git
   git push -u origin main
   ```
3. In your repo on GitHub: **Settings → Pages → Source → GitHub Actions**.
4. The workflow in `.github/workflows/deploy.yml` runs automatically on every push to `main`.
5. Your site is live at `https://<username>.github.io/<repo>/`.

---

## Tech stack

| Concern | Library / approach |
|---|---|
| Chart | [D3.js v7](https://d3js.org) (loaded from cdnjs CDN) |
| Data | Plain CSV, fetched at runtime with `d3.csv()` |
| Styling | Vanilla CSS custom properties |
| Hosting | Static files — any web server, GitHub Pages, Netlify, etc. |
| Build | None — no bundler, no transpiler, no npm |

---

## Citation

> Baulch, B. & Feeny, S. (2026). Aid and progress towards the Sustainable Development Goals.
> RMIT University, Ho Chi Minh City / Melbourne.
