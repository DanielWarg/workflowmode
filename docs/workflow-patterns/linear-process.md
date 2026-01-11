# Workflow Pattern: Linear Process

**Syfte:**
Används för sekventiella processer utan komplexa förgreningar. Passar bra för checklistor, onboarding-steg eller enkla guider.

**Regler:**
- **Layout:** Enkel rad från vänster till höger (eller top-down).
- **Lanes:** Oftast bara en ("Process" eller "Main").
- **Noder:** Start -> Steg 1 -> Steg 2 -> ... -> Slut.
- **Beslut:** Inga, eller mycket enkla (t.ex. vid fel).

## System Prompt Guidelines

När användaren ber om en linjär process:
1. Skapa ALLTID en StartNode och en EndNode.
2. Placera alla steg i sekvens.
3. Använd "StepNode" för alla aktiviteter.
4. Håll korta, imperativa titlar på stegen.

## Few-Shot Example

**User:**
"Skapa en checklista för att publicera en bloggpost."

**Assistant (WorkflowSpec):**
```json
{
  "lanes": [
    { "id": "main", "label": "Publiceringsflöde" }
  ],
  "nodes": [
    { "id": "start", "type": "start", "title": "Start", "laneId": "main" },
    { "id": "step1", "type": "step", "title": "Skriv utkast", "description": "Skriv första versionen i Google Docs", "laneId": "main" },
    { "id": "step2", "type": "step", "title": "Korrekturläs", "description": "Leta efter stavfel och syftningsfel", "laneId": "main" },
    { "id": "step3", "type": "step", "title": "Skapa bild", "description": "Generera cover image i Midjourney", "laneId": "main" },
    { "id": "step4", "type": "step", "title": "Publicera", "description": "Lägg upp på WordPress", "laneId": "main" },
    { "id": "end", "type": "end", "title": "Klar", "laneId": "main" }
  ],
  "edges": [
    { "id": "e1", "from": "start", "to": "step1" },
    { "id": "e2", "from": "step1", "to": "step2" },
    { "id": "e3", "from": "step2", "to": "step3" },
    { "id": "e4", "from": "step3", "to": "step4" },
    { "id": "e5", "from": "step4", "to": "end" }
  ],
  "metadata": {
    "name": "Bloggpublicering",
    "description": "Checklista för blogg"
  }
}
```
