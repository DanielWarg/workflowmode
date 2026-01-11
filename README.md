# Antigravity — Prompt-first Workflow Canvas

Antigravity är en AI-driven canvas för att skapa visuella arbetsflöden från text. Inspirerad av Miroverse men generativ och "prompt-first".

## 🚀 Features

### Core
- **AI-kompilering**: Omvandlar naturligt språk till `WorkflowSpec` (JSON).
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

## License

MIT
