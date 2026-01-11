Antigravity — Prompt-first Workflow Canvas (Live SaaS) — Root Script
0) Kontext & mål

Detta är ett live SaaS-projekt, inte en demo eller hobby. Vi bygger en prompt-first “workflow compiler” som ritar upp kompletta, snygga flöden på en canvas från en enkel prompt eller paste (t.ex. Teams-protokoll). Produkten ska kännas som Cursor/Lovable, där användaren skriver sin intention och får ett färdigt, begripligt visuellt workflow — med trygg kontroll (preview → apply) och historik.

North Star:
“Jag beskriver hur det ska funka → appen bygger ett komplett workflow (grafiskt) → jag finslipar med prompt.”

Out of scope i V1: 250 integrationer, inbyggd video, “ritprogram”-features som frihand som kärna.

1) Kärnprinciper (måste genomsyra allt)

Workflow mode är default. Canvas är en rendering av en workflow-spec, inte tvärtom.

AI kompilerar, den ritar inte fritt. AI returnerar strikt validerade strukturer (WorkflowSpec + Diff).

Trygghet: Preview → Apply. Inga magiska ändringar utan diff och möjlighet att kasta.

Determinism. Samma input ska ge stabil output. IDs och apply ska vara idempotent.

SaaS-säkerhet från dag 1. Auth/permissions, audit log, rate limiting, secrets-hygien, minsta privilegium.

AI är optional. Systemet ska fungera som workflow-editor även om AI är nere.

2) Produktfunktioner (V1 scope — “WOW MVP”)
2.1 Workflow Compilation (WOW-mode)

Användaren kan:

Skriva: “Bygg ett kundtjänstflöde för reklamationer”

Eller paste: Teams-protokoll/anteckningar/policy
Systemet ska:

Tolka och skapa ett komplett workflow med:

start/end

steps

decisions med grenar

swimlanes (roller/aktörer)

exceptions/escalations (minst grundstöd)

Rendera workflowet snyggt och läsbart på canvas med stabil layout

2.2 Prompt-first UX (Cursor-känsla)

Chatt/promptpanel + canvas sida vid sida

Prompt på svenska

“Generating…” progressiv rendering i previewläge

Preview (ghost) → Apply / Discard

Refine-kommandon:

“Dela upp steg X i tre steg”

“Lägg till beslut efter steg Y”

“Lägg till eskalering om VIP”

“Flytta steg Z till Backoffice-lanen”

“Byt namn på steg …”

“Gör flödet mer ITIL-likt”

2.3 Collaboration (realtid)

Flera användare kan se och redigera samma workflow i realtid

Presence + (valfritt V1) multi-cursor

Konflikthantering deterministiskt (CRDT/Yjs)

2.4 Historik & kontroll

Undo/redo

Version history av workflow spec

Replay (valfritt V1.5) — visa hur workflowet byggdes över tid

Audit log vid Apply (vem gjorde vad)

2.5 Export & delning

Share-link (viewer/editor/owner)

Export PNG

Export PDF (V1.5)

Export text: decisions/actions

3) Datamodell: WorkflowSpec är “source of truth”
3.1 WorkflowSpec (concept)

WorkflowSpec representerar ett workflow på ett validerbart sätt. Canvas är en rendering av spec:en.

Minsta fält:

lanes: [{ id, name, order }]

nodes: [{ id, type, laneId, title, description?, metadata }]

edges: [{ id, from, to, type, label? }]

metadata: { domain?, language: “sv”, createdBy, createdAt, version }

Node types (V1):

start, end

step

decision (branches)

exception/escalation (kan vara type=step med metadata i V1, men ska vara explicit i schema)

Edge types:

normal

decision_yes / decision_no (eller label-baserat)

loop

escalation

3.2 Persistence & multi-tenant (SaaS)

boards/workflows sparas i DB

capability links:

owner_token

editor_token

viewer_token

senare: auth + “claim board” kopplar token → user

4) AI-kontrakt (validering & guardrails)

AI får endast returnera:

workflowSpec (valid enligt schema)

diffSummary (mänskligt läsbart)

optional: warnings/assumptions

Guardrails:

Max antal noder/edges per apply (för att undvika runaway)

Destruktiva ändringar kräver extra bekräftelse (delete/merge många)

Server-side schema validation alltid

Idempotent apply: samma diff ska inte duplicera noder

5) Arkitektur (webapp)
Frontend

Next.js (App Router) + TypeScript

Canvas-renderer (React Flow eller egen renderer)

Yjs för realtime state (endast committed state)

Proposal state (ghost preview) lokalt, aldrig i Yjs

Backend

API för:

compile workflow (prompt/paste → WorkflowSpec)

refine workflow (spec + instruction → new spec + diff)

persist/load versions

permissions & tokens

audit log

Rate limiting på AI endpoints och join/sync

Realtime

Yjs provider (websocket) eller managed realtime

Målet: stabilt och deterministiskt

6) CI/CD (GitHub Actions) — måste finnas från början
CI på PR + main

lint

typecheck

tests (unit)

e2e (Playwright)

build

Security automation

Dependabot weekly (npm)

CodeQL (JS/TS)

(valfritt) secret scanning

Branch protection (main)

Require PR

1 approval

Require status checks: CI / checks (+ CodeQL när aktivt)

Require branches up-to-date

Block force pushes

Restrict deletions

Require linear history

(senare) Require CODEOWNERS

Deploy

Vercel Git Integration:

Preview deploy på PR

Production deploy på main

Inga Vercel CLI deploy workflows i Actions

7) Säkerhet (måste från dag 1)

Secrets: endast i GitHub/Vercel env vars

Minsta privilegium

RLS om Supabase används

Rate limiting (AI + sync/join)

Audit log för Apply

Content policy för AI input (size limits, sanitization)

Loggning utan att läcka känsligt innehåll (redaction)

Dokument:

SECURITY.md: policy + incident basics

OPERATIONS.md: drift + felsökning

8) UX / Design (premium)

Dark-first, light-mode stöd

Minimal toolbar (inte Miro)

Chat känns som Cursor

Microinteractions:

“preview pulse” på nya delar

highlight diff

smooth camera-pan till berörd del

Responsiv:

Desktop full

Mobile read-first (view + chat)

9) Acceptance Criteria (Definition of Done för V1)

Prompt: “Bygg kundtjänstflöde för reklamation” → ger workflow med lanes, steps, decisions och snygg layout

Paste Teams-protokoll → workflow genereras med beslut och actions

Preview → Apply → workflow blir committed och synkar i två flikar

Refine prompt: “lägg till eskalering om VIP” → preview → apply fungerar

Export PNG fungerar

Share-link viewer/editor fungerar

CI grönt på PR och main, CodeQL aktivt, Dependabot PRs weekly

Basic security: rate limit på AI endpoint, schema validation server-side, audit log vid apply

10) Leveransplan (hårt prioriterad)

Fas 1 — WorkflowSpec + Renderer (layout + lanes)
Fas 2 — Compile endpoint + Preview/Apply UX
Fas 3 — Realtime (Yjs) + versioning
Fas 4 — Refine commands + export/share
Fas 5 — Hardening: rate limit, audit, observability, polish

11) Uppdrag till Antigravity (bygg detta nu)

Skapa/uppdatera docs/workflow-spec.md med:

WorkflowSpec schema (JSON Schema)

3 exempel: Kundtjänstflöde, Incidentflöde, Teams-protokoll → workflow

Implementera API:

POST /api/workflow/compile (prompt/paste → WorkflowSpec + diffSummary)

POST /api/workflow/refine (spec + instruction → new spec + diffSummary)

Server-side schema validation på svaren

Frontend:

ChatPanel med “Workflow mode” default

Preview (ghost) rendering av workflowSpec

Apply/Discard

Diff highlight + camera focus

Persistence:

Save/load workflow per board-id

Version history (minst senaste N)

Share-link tokens (viewer/editor/owner)

Realtime:

Yjs committed state

proposal local state (aldrig i Yjs)

12) Non-goals (för att undvika scope creep)

Full Miro-paritet

Video calls

250 integrationer

Komplett template marketplace

Ritprogram med frihand som kärna

13) Prompt-exempel (för test)

“Bygg ett kundtjänstflöde för reklamationer i tre lanes: Kund, Support, Backoffice. Lägg in beslut om garanti gäller. Lägg till eskalering vid VIP.”

“Här är ett mötesprotokoll: [paste]. Gör ett workflow med beslut, actions och ansvar.”

“Gör flödet mer ITIL-likt och lägg till en loop för kompletterande information.”

14) Repo-filer som ska finnas (baseline)

.github/workflows/ci.yml

.github/dependabot.yml

.github/CODEOWNERS

SECURITY.md

OPERATIONS.md

README.md (checklista för branch protection + Vercel import)

docs/workflow-spec.md

docs/architecture.md (kort)

docs/product.md (denna spec kan bo där)

Slut.