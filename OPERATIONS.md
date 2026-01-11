# Operations / Runbook

Den här filen beskriver hur man kör, felsöker och driftar Antigravity lokalt och i production.

## Lokalt (utveckling)

### Krav
- Node.js (rekommenderat: 20+)
- npm

### Starta

1. Installera beroenden:
   - `npm install` (första gången)
2. Miljövariabler:
   - Skapa `.env` och sätt minst `OPENAI_API_KEY`
3. Starta:
   - `npm run dev`

Detta startar:
- Next.js på `http://localhost:3000`
- Hocuspocus/Yjs-server på `ws://localhost:1234`

## Felsökning (snabbt)

- **AI svarar inte / 500 på compile/refine**
  - Kontrollera `.env` → `OPENAI_API_KEY`
  - Kontrollera att API-routen validerar JSON mot `src/lib/schema.ts`

- **Realtime sync funkar inte**
  - Kontrollera att websocket-servern kör (`npm run server`)
  - Kontrollera klientens websocket-url (Hocuspocus provider)

- **Canvas/layout ser konstig ut**
  - Verifiera att `WorkflowSpec` är valid (lanes/nodes/edges/metadata)
  - Säkerställ att noder har korrekta `laneId` och att edges pekar på existerande noder

## Produktion (kort)

- Kör via Vercel Git Integration (Preview deploy på PR, Production deploy på main).
- Lägg secrets som env vars i Vercel (aldrig i repo).

