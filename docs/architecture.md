# Architecture (kort)

## Översikt

Antigravity består av:
- **Next.js App Router** för UI + API routes
- **WorkflowSpec** (Zod) som “source of truth” för data
- **Canvas-rendering** (React Flow) som renderar specen
- **Realtime collaboration** via Yjs + Hocuspocus
- **AI endpoints** som kompilerar/refinar text → `WorkflowSpec`

## Data- och kontrollflöde

1. Användaren skriver/pastar i chatten.
2. UI anropar:
   - `POST /api/workflow/compile` (för nytt workflow)
   - `POST /api/workflow/refine` (för att förfina befintligt workflow)
3. Servern pratar med AI-modell och returnerar:
   - `workflowSpec` (validerad mot `src/lib/schema.ts`)
   - `diffSummary` (+ ev. `assumptions`/`warnings`)
4. Klienten renderar resultatet som **preview** (ghost).
5. Vid **Apply** skrivs committed state (och synkas i realtime).

## Realtime

- **Committed state** synkas via Yjs (CRDT) över Hocuspocus (WebSocket).
- **Proposal/preview state** ska vara lokalt (inte i Yjs), så “preview → apply” är tryggt.

## Source of truth

- `src/lib/schema.ts` är kontraktet för `WorkflowSpec` och AI-responser.

