# Faculty Appraisal: Frontend

React + TypeScript + Vite + Tailwind CSS v4 + React Router + Axios.
Design and PDF-alignment docs: `../docs/ui/` (start with `information-architecture.md` and `pdf-audit.md`).

```bash
npm install
npm run dev          # http://localhost:5173, uses the built-in mock API by default
npm run build
```

> If the project path contains `&` (as this one does), `npm run` / `npx` can fail on Windows.
> Call the binaries directly instead: `node node_modules/vite/bin/vite.js` and `node node_modules/typescript/bin/tsc -b`.

## Connecting the real backend
Copy `.env.example` to `.env`, set `VITE_API_URL` and `VITE_USE_MOCK=false`.
Endpoints the UI expects are listed in `docs/ui/information-architecture.md`; all calls live in `src/lib/api.ts`.

## Source of truth
The form follows the college's *Faculty Self-Appraisal & Assessment Report* (Sri Vasavi Engineering College).

- `src/data/appraisalSchema.ts`: steps, sections, tables and fields transcribed from the PDF. Anything not defined by the PDF is marked `provisional`.
- `src/data/scoring.ts`: the nine criteria and the cadre-wise **maximum** marks (Annexure A).
- Scores (`maxScore`, `selfScore`) are only ever displayed from API data. The PDF gives no scoring formula, so the frontend calculates nothing.
- `src/lib/mockAdapter.ts` is placeholder data for local development only.
