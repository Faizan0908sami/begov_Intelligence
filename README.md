# BeGov Intelligence

**Real-time government scheme monitoring dashboard for Ayushman Bharat (PM-JAY) in Uttar Pradesh.**

BeGov Intelligence surfaces the gap between official KPI compliance and ground-level citizen experience across 70+ districts. It combines structured performance metrics with citizen sentiment data, journalism corroboration, and accountability tracking to produce actionable intelligence briefs for state-level decision-makers.

![React](https://img.shields.io/badge/React-19-blue) ![Vite](https://img.shields.io/badge/Vite-8-purple) ![Claude API](https://img.shields.io/badge/Claude_API-Sonnet-orange) ![Vercel](https://img.shields.io/badge/Deploy-Vercel-black)

---

## What it does

**District-level monitoring** — Each of the 70+ UP districts is tracked on KPI compliance, citizen sentiment score, KPI–sentiment divergence, gaming flags, and missed commitments. Districts are classified as Critical, Attention, Improving, or Aligned.

**Weekly intelligence briefs** — An LLM-generated brief (via Claude API) synthesizes district signals into a structured report: state-of-scheme summary, district-by-district changes, and carry-forward accountability items. Formatted for a Principal Secretary audience.

**District deep-dive reports** — Click any district for a full intelligence report: executive summary, KPI breakdown, sentiment intelligence by source, weekly timeline, diagnosis, recommended actions, and accountability status.

**Interactive chat** — Ask natural-language questions about district performance, scheme status, or cross-district comparisons. Context-aware via Claude API with full district data in the system prompt.

**KPI–Sentiment divergence detection** — The core analytical signal. High KPI + negative sentiment flags potential gaming or data manipulation. Low KPI + positive sentiment identifies capacity-constrained but well-functioning districts.

## Architecture

```
src/App.jsx          Single-file React app (dashboard, briefs, reports, chat)
api/brief.js         Vercel serverless — generates weekly intelligence briefs via Claude
api/chat.js          Vercel serverless — proxies contextual chat queries to Claude
```

Frontend is a single React component with inline styles. No routing library, no state management library — deliberate choice for a prototype that prioritizes speed of iteration over modularity.

## Setup

```bash
git clone https://github.com/Faizan0908sami/begov_Intelligence.git
cd begov_Intelligence
npm install
```

Create a `.env` file from the template:

```bash
cp .env.example .env
# Add your Claude API key to .env
```

Run locally:

```bash
npm run dev
```

## Deployment

Deployed on Vercel. The `api/` directory contains serverless functions that are automatically detected.

Required environment variable on Vercel: `CLAUDE_API_KEY`

## Tech stack

React 19, Vite 8, Recharts (visualizations), Claude API via Vercel serverless functions. No CSS framework — all styles are inline for single-file simplicity.

## License

Private project. Not open-source.
