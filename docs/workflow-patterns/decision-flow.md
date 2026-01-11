# Workflow Pattern: Decision Flow

**Syfte:**
Används när logik och vägval är centralt. Passar för policy-tolkning, godkännandeprocesser eller felsökning.

**Regler:**
- **Noder:** Rikligt med `DecisionNode`.
- **Edges:** Måste ha tydliga labels ("Ja", "Nej", "Godkänd").
- **Färger:** Använd röd/grön semantik för edges vid behov (via `type: 'decision_yes' | 'decision_no'`).
- **Avslut:** Kan ha flera EndNodes (t.ex. "Godkänd" och "Avslagen").

## System Prompt Guidelines

1. Identifiera alla beslutspunkter i prompten.
2. För varje beslut, skapa en DecisionNode.
3. Skapa explicita vägar för varje utfall.
4. Lämna inga "dead ends" (alla vägar ska leda till en EndNode eller loopa tillbaka).

## Few-Shot Example

**User:**
"Beslutsträd för att godkänna semesteransökan."

**Assistant (WorkflowSpec):**
```json
{
  "lanes": [
    { "id": "hr", "name": "HR-process", "order": 0 }
  ],
  "nodes": [
    { "id": "start", "type": "start", "title": "Ansökan inkom", "laneId": "hr" },
    { "id": "check_days", "type": "decision", "title": "Finns dagar kvar?", "laneId": "hr" },
    { "id": "check_conflict", "type": "decision", "title": "Krockar med andra?", "laneId": "hr" },
    { "id": "approve", "type": "step", "title": "Godkänn ansökan", "laneId": "hr" },
    { "id": "deny", "type": "step", "title": "Avslå ansökan", "laneId": "hr" },
    { "id": "end_ok", "type": "end", "title": "Beviljad", "laneId": "hr" },
    { "id": "end_deny", "type": "end", "title": "Avslagen", "laneId": "hr" }
  ],
  "edges": [
    { "id": "e1", "from": "start", "to": "check_days", "type": "normal" },
    { "id": "e2", "from": "check_days", "to": "check_conflict", "label": "Ja", "type": "decision_yes" },
    { "id": "e3", "from": "check_days", "to": "deny", "label": "Nej", "type": "decision_no" },
    { "id": "e4", "from": "check_conflict", "to": "approve", "label": "Nej", "type": "decision_no" },
    { "id": "e5", "from": "check_conflict", "to": "deny", "label": "Ja", "type": "decision_yes" },
    { "id": "e6", "from": "approve", "to": "end_ok", "type": "normal" },
    { "id": "e7", "from": "deny", "to": "end_deny", "type": "normal" }
  ],
  "metadata": {
    "name": "Semestergodkännande",
    "description": "Logik för semesterbeslut"
  }
}
```
