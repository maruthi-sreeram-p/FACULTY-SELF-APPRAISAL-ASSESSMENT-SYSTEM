# Faculty Appraisal: Frontend

React + TypeScript + Vite + Tailwind CSS v4 + React Router + Axios.
Docs: `../docs/ui/` (design, IA, PDF audit) and `../docs/backend/` (API contract, domain model, service boundaries, PostgreSQL design).

```bash
npm install
npm run dev          # http://localhost:5173, uses the built-in mock API by default
npm run build
```

> If the project path contains `&` (as this one does), `npm run` / `npx` can fail on Windows.
> Call the binaries directly instead: `node node_modules/vite/bin/vite.js` and `node node_modules/typescript/bin/tsc -b`.

## Source of truth
The form follows the college's *Faculty Self-Appraisal & Assessment Report* (Sri Vasavi Engineering College).

- `src/data/appraisalSchema.ts`: steps, sections, tables and fields transcribed from the PDF. Each block `id` is its **contract path** and each field `key` its **contract property**; select values are contract enum codes. Anything not defined by the PDF is marked `provisional`.
- `src/data/scoring.ts`: the nine criteria and the cadre-wise **maximum** marks (Annexure A). The PDF gives no scoring formula, so the frontend calculates nothing; self-scores come from the backend.

## Backend contract (frozen, PROPOSED)
- `src/contract/dto.ts`: the wire types.
- `src/contract/mapper.ts`: converts between the UI form state (strings) and the wire shape, driven by the schema.
- `src/lib/api.ts`: services calling the proposed endpoints (`/api/v1/...`).
- `src/lib/mockAdapter.ts`: a mock backend that stores and returns the same DTOs. Placeholder data only.

## Connecting a real backend
Copy `.env.example` to `.env`, set `VITE_API_URL` and `VITE_USE_MOCK=false`. The endpoints are listed in `docs/backend/api-contract.md`. They are **PROPOSED — REQUIRES BACKEND IMPLEMENTATION**.
