# Antigravity — Prompt-first Workflow Canvas

Antigravity är en AI-driven canvas för att skapa visuella arbetsflöden från text. Inspirerad av Miroverse men generativ och "prompt-first".

## 🚀 Features

### Core
- **AI-kompilering**: Omvandlar naturligt språk till `WorkflowSpec` (JSON).
- **Meeting Intelligence**: Äkta process-logik för mötesanteckningar (Start -> Beslut -> Action -> Slut).
- **Patterns**: Använd mallar som `/linear`, `/decision`, `/swimlane` för bästa resultat.
- **Workflow Mode**: Enkel chatt-interface till vänster, oändlig canvas till höger.

### Collaboration (Realtime)
- **Multi-user sync**: Se ändringar direkt (Yjs + Hocuspocus).
- **Undo/Redo**: Full historik på noder och edges.
- **Presence**: Se när andra är anslutna.

### UI/UX
- **Premium Design**: Teal/Cyan tema, smooth animations, glassmorphism.
- **Dark/Light Mode**: Fullt stöd via `useTheme`.
- **Keyboard Shortcuts**: `Cmd+Enter` för att skicka, `Cmd+Z` för ångra.
- **Navigator (list ↔ flow)**: Klicka på “Åtgärder/Öppna frågor/Uppföljning” för att zooma/markera rätt nod på canvasen.
- **Fit-to-view**: Workflow autoskalar så hela flödet syns direkt efter generering.

## 🛠 Tech Stack

- **Frontend**: Next.js 14 (App Router), React, Tailwind CSS.
- **Canvas**: React Flow.
- **State**: Yjs (CRDT), Hocuspocus (WebSocket).
- **AI**: OpenAI API (GPT-4o).
- **Validation**: Zod (Schema).

## ⚡️ Quick Start

1. **Installera beroenden:**
   ```bash
   npm install
   ```

2. **Miljövariabler:**
   Skapa en `.env` fil:
   ```env
   OPENAI_API_KEY=sk-...
   ```

3. **Starta utvecklingsservern:**
   Detta startar både Next.js frontend (3000) och Hocuspocus server (1234).
   ```bash
   npm run dev
   ```

4. **Öppna appen:**
   Gå till [http://localhost:3000](http://localhost:3000).

## 📚 Documentation

- [Workflow Spec](./docs/workflow-spec.md) - Datamodell
- [Workflow Patterns](./docs/workflow-patterns/) - Designmönster

## 🗺️ Roadmap & Status

See [projektplan.md](./projektplan.md) for the master plan.
We are currently executing **The Wedge Strategy**:
1.  **Phase 1 (Current)**: Meeting Mode (Notes -> Actions).
2.  **Phase 2**: Refinement & Audit Log.
3.  **Phase 3**: Enterprise Ecosystem.

## 🧠 Context for AI Agents

If you are an AI taking over this project, read these files in order:
1.  `README.md` (This file) - Tech stack & Overview.
2.  `projektplan.md` - Strategic goals and milestones.
3.  `task.md` (if available) - Current tactical checklist.
4.  `script.md` - Product Vision & Soul.
5.  `src/lib/schema.ts` - The source of truth for the Data Model.


## License

MIT
