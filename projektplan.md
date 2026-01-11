# Projektplan: Antigravity (Wedge Strategy)

**Vision:** "Paste a meeting → get a decision & action flow".
Vi bygger momentum efter möten genom att omvandla ostrukturerade anteckningar till visuella flöden.

## ✅ Completed Foundation (Baseline)
- [x] **Core Engine**: React Flow canvas, AI compilation (`/api/workflow/compile`), Workflow Spec.
- [x] **Premium UX**: Chat panel, Teal/Dark mode, Glassmorphism.
- [x] **Realtime Collaboration**: Yjs, Hocuspocus, WebSocket, Client Presence.
- [x] **Pattern Awareness**: Stöd för Linear, Decision, Swimlane m.fl.

---

## 🚀 The Wedge Plan: Meeting Mode

### 📍 Fas 1: First-Run & Interpretation (Fokus Nu)
*Mål: "WOW" på < 60 sekunder när användaren klistrar in mötesanteckningar.*

- [x] **Landing / Empty State**:
    - [x] Ren canvas, ingen toolbar (till "First Run").
    - [x] Copy: "Paste your meeting notes. I’ll turn them into a clear decision & action flow."
    - [x] Auto-detection av "Meeting Input" (Visual prep).
- [ ] **AI Interpretation Layer**:
    - Ny system-prompt för möten (Extract Decisions, Actions, Open Questions).
    - Heuristiker för att skapa "Primary Pattern: Decision + Action Flow".
- [ ] **Enhanced Preview**:
    - Overlay: "I found 3 decisions, 5 actions..."
    - "Explain-why": Klickbar förklaring på varför noder skapades.
- [ ] **Export v1**: PNG & Text (Decisions/Actions list).

### � Fas 2: Momentum & Refinement
*Mål: Från "Coolt" till "Användbart i arbete".*

- [ ] **Commit Workflow**: "Apply" låser state och skapar audit-log (Version History).
- [ ] **Refine Intents**: Knappar för actions ("Assign owners", "Add follow-up").
- [ ] **Owners & Deadlines**: Rika metadata på noder.

### � Fas 3: Ecosystem Expansion
*Mål: Enterprise adoption.*

- [ ] **Share Links**: Viewer/Editor länkar.
- [ ] **Export v2**: Jira/Asana integration.
- [ ] **Multi-meeting flows**: Koppla ihop flera möten.

---

## � Aktuella Uppgifter (Task List)
Se `task.md` för detaljerad lista.
