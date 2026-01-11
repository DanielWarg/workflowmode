# Workflow Pattern: Swimlane Process

**Syfte:**
Används när flera roller, avdelningar eller system samverkar. Tydliggör ansvar och överlämningar ("hand-offs").

**Regler:**
- **Lanes:** En lane per Roll/Avdelning (t.ex. "Kund", "Support", "Tekniker").
- **Flöde:** Edges som korsar lanes representerar överlämningar.
- **Kronologi:** Generellt vänster-till-höger, men kan hoppa fram och tillbaka mellan lanes.

## System Prompt Guidelines

1. Identifiera alla unika aktörer i prompten.
2. Skapa en Lane för varje aktör.
3. Placera varje steg i rätt actors lane.
4. Om en handling ("Godkännande") kräver en annan aktör, dra en edge över lane-gränsen.

## Few-Shot Example

**User:**
"Supportflöde mellan Kund, First Line och Second Line."

**Assistant (WorkflowSpec):**
```json
{
  "lanes": [
    { "id": "customer", "name": "Kund", "order": 0 },
    { "id": "l1", "name": "First Line Support", "order": 1 },
    { "id": "l2", "name": "Second Line Support", "order": 2 }
  ],
  "nodes": [
    { "id": "start", "type": "start", "title": "Mejl inkommer", "laneId": "customer" },
    { "id": "triage", "type": "step", "title": "Triagera ärende", "laneId": "l1" },
    { "id": "complex", "type": "decision", "title": "Komplext?", "laneId": "l1" },
    { "id": "solve_l1", "type": "step", "title": "Lös ärende", "laneId": "l1" },
    { "id": "escalate", "type": "step", "title": "Utred grundorsak", "laneId": "l2" },
    { "id": "notify", "type": "step", "title": "Meddela kund", "laneId": "l1" },
    { "id": "end", "type": "end", "title": "Ärende stängt", "laneId": "customer" }
  ],
  "edges": [
    { "id": "e1", "from": "start", "to": "triage", "type": "normal" },
    { "id": "e2", "from": "triage", "to": "complex", "type": "normal" },
    { "id": "e3", "from": "complex", "to": "solve_l1", "label": "Nej", "type": "decision_no" },
    { "id": "e4", "from": "complex", "to": "escalate", "label": "Ja", "type": "decision_yes" },
    { "id": "e5", "from": "solve_l1", "to": "notify", "type": "normal" },
    { "id": "e6", "from": "escalate", "to": "notify", "type": "escalation" },
    { "id": "e7", "from": "notify", "to": "end", "type": "normal" }
  ],
  "metadata": {
    "name": "Support-eskalering",
    "description": "Flöde över avdelningsgränser"
  }
}
```
