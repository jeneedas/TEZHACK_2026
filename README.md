# DRISHTI — District Administration / EOC Portal

## Project Overview
- **Name**: DRISHTI District Administration Portal (District Emergency Operations Center)
- **Goal**: Central command portal for Kamrup District disaster response — collects citizen/field reports, runs a mock AI/ML intelligence engine to score priority/confidence/information-fog, and coordinates dispatch of limited emergency resources.
- **Design language**: Light-mode-only, government-operations UI (white panels, light grey background, thin borders, 2–4px corners, restrained blue/red/orange/green palette, Inter font). No dark mode, no glassmorphism, no gradients.

## URLs
- **Local dev (sandbox)**: served on port 3000 via `pm2 start ecosystem.config.cjs`
- **Production**: deploy via Cloudflare Pages (see Deployment section)

## Tech Stack
- React 18 + TypeScript + Vite (client-side SPA, HashRouter)
- Tailwind CSS (custom palette matching spec: `#F5F6F7`, `#FFFFFF`, `#171717`, `#5F6368`, `#DADDE1`, `#1558A6`, `#B42318`, `#B54708`, `#287D3C`, `#EAF2FB`)
- Leaflet + react-leaflet + OpenStreetMap tiles (Kamrup District focused map)
- Lucide React icons
- Recharts (available for future chart needs)
- Deployed as a static site to Cloudflare Pages

## Data Architecture
- **Types** (`src/types/index.ts`): Incident, Report, Resource, RouteOption, Assignment, FieldUpdate, Verification, Hospital, ReliefCamp, AlertItem, InformationFogArea
- **Mock data** (`src/data/`): Kamrup boundary/places, 10 demo incidents, 17 demo reports, 8 resources, 4 hospitals, 4 relief camps, field updates, route options, information-fog areas
- **Mock intelligence service** (`src/services/intelligenceService.ts`): deterministic `calculatePriority`, `calculateConfidence`, `calculateInformationFog`, `calculateReportCredibility`, `recommendResource`, `recommendRoute` functions — all UI pages consume these rather than hard-coding scores
- **Global state** (`src/context/DataContext.tsx`): single source of truth for incidents/reports/resources/assignments/field-updates/verifications; incident scores are re-derived automatically whenever reports change, powering the closed feedback loop (dispatch → field update → verification → updated priority)
- **Storage**: in-memory only for this PoC (no backend/D1 — pure static frontend demo, as specified in the build brief)

## Pages / Routes
- `/` Dashboard — district summary, Kamrup map, alerts, response priority table
- `/situation` Live Situation — district overview stats + full map
- `/incident-map` Incident Map — full-screen operational map
- `/incidents` Incident Reports — filterable table of all incidents
- `/incidents/:id` Incident Details — situation, AI assessment, response, field updates, route comparison, attached reports
- `/intelligence` AI Assessment — per-incident priority/confidence/fog breakdown, priority factors explainer, AI decision loop diagram
- `/information-fog` Information Fog — map + high-uncertainty location list
- `/verification` Report Verification — incoming low-credibility reports + verification-team assignment/submission workflow (confidence/fog before→after)
- `/resources` Available Resources — resource status table
- `/dispatch` Dispatch — incidents awaiting dispatch + dispatch log
- `/field-teams` Field Teams — team tracking + field update log
- `/hospitals` Hospital Capacity
- `/relief-camps` Relief Camps
- `/history` History — resolved incidents, dispatch log, verification history
- `/downloads` Download Data (CSV export) + configurable Emergency Contacts with `tel:` call buttons
- `/login` Login (demo, non-blocking — submits straight to dashboard)

## Demo Flow (closed loop)
1. Village C flood incident (`INC-1042`) starts as `AWAITING_DISPATCH`, priority 94, confidence 91%.
2. Admin opens the incident on the map → AI recommends **SDRF Boat 04** via **Route B** (low risk vs. flooded Route A).
3. Admin clicks **Dispatch Resource** → assignment created, resource status → `EN_ROUTE`, ETA shown.
4. Field Teams page lets the admin log a field update ("12 rescued, 11 remain").
5. Information Fog demo: Village X (`INC-1020`) has 3 conflicting reports, confidence 34%, fog 82% → Report Verification page → **Assign Verification Team** → **Submit Field Verification Data** → confidence rises to 88%, fog drops to 19%, incident status returns to `AWAITING_DISPATCH` with recalculated priority.

## User Guide
1. Open the app — lands on the District Situation dashboard.
2. Use the left sidebar to move between Situation / Intelligence / Response / Relief / Reports sections.
3. Click any marker on the Kamrup map to open the incident/resource/hospital/camp panel.
4. Toggle map layers (Incidents, Affected Areas, Response Teams, Hospitals, Relief Camps, Road Hazards, Information Fog) top-right of the map.
5. From an incident panel or the Dispatch page, click **Dispatch Resource** to confirm the AI-recommended team/boat.
6. Use the Report Verification page to resolve low-confidence incidents via a field-verification team, then watch confidence/fog update.

## Deployment
- **Platform**: Cloudflare Pages (static SPA build, `dist/` output)
- **Status**: ✅ Built and running in sandbox (PM2 + Vite dev server on port 3000); ready for `wrangler pages deploy dist` once Cloudflare credentials are configured
- **Build**: `npm run build` (tsc -b && vite build)
- **Tech Stack**: React + TypeScript + Vite + Tailwind CSS + Leaflet
- **Last Updated**: 30 August 2026

## Not Yet Implemented (P1/P2 per spec)
- Real backend / D1 persistence (data is in-memory, resets on reload)
- Real routing API / real-time GPS
- WebSocket live updates
- Cross-portal integration with Citizen Portal / Relief & Response Services Portal (separate projects)
