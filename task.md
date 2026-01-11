# Task List (Aktuella uppgifter)

Den här filen är den taktiska checklistan som `projektplan.md` och `README.md` refererar till.

## Fas 1: First-Run & Interpretation (Fokus Nu)
- [ ] **AI Interpretation Layer**
  - [ ] Ny system-prompt för möten (Extract Decisions, Actions, Open Questions).
  - [ ] Heuristiker för "Primary Pattern: Decision + Action Flow".
- [ ] **Enhanced Preview**
  - [ ] Overlay: "Jag hittade X beslut, Y actions..."
  - [ ] "Explain-why": klickbar förklaring på varför noder skapades.
- [ ] **Export v1**
  - [ ] PNG-export
  - [ ] Text-export (Decisions/Actions list)

## Docs & repo-hygien (snabbfixar)
- [x] Synka `docs/workflow-patterns/*` exempel med `src/lib/schema.ts` (lane `name/order`, edge `type`).
- [x] Synka prompt-dokumentation: default language `sv` i exempel där det är relevant.
- [x] Lägg till CI (lint/typecheck/build) för PR + main.
- [x] Lägg till CodeQL-analys.
- [x] Lägg till Dependabot (npm).
- [x] Lägg till `CODEOWNERS`.
- [x] Lägg till `SECURITY.md` och `OPERATIONS.md`.
- [x] Lägg till `docs/architecture.md` och `docs/product.md`.

