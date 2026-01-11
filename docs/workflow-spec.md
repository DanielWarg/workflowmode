# WorkflowSpec — Schema Definition

WorkflowSpec är systemets "source of truth". Canvas-renderingen är alltid en visualisering av specen.

## JSON Schema

```typescript
interface WorkflowSpec {
  lanes: Lane[];
  nodes: Node[];
  edges: Edge[];
  metadata: WorkflowMetadata;
}

interface Lane {
  id: string;
  name: string;
  order: number;
}

interface Node {
  id: string;
  type: 'start' | 'end' | 'step' | 'decision';
  laneId: string;
  title: string;
  description?: string;
  metadata?: NodeMetadata;
}

interface Edge {
  id: string;
  from: string;
  to: string;
  type: 'normal' | 'decision_yes' | 'decision_no' | 'loop' | 'escalation';
  label?: string;
}

interface WorkflowMetadata {
  domain?: string;
  language: string; // default: 'sv'
  createdBy?: string;
  createdAt?: string;
  version: number;
}
```

---

## Exempel 1: Kundtjänstflöde för reklamationer

```json
{
  "lanes": [
    { "id": "lane-customer", "name": "Kund", "order": 0 },
    { "id": "lane-support", "name": "Support", "order": 1 },
    { "id": "lane-backoffice", "name": "Backoffice", "order": 2 }
  ],
  "nodes": [
    { "id": "start", "type": "start", "laneId": "lane-customer", "title": "Kund inkommer med reklamation" },
    { "id": "step-1", "type": "step", "laneId": "lane-support", "title": "Registrera ärende" },
    { "id": "decision-1", "type": "decision", "laneId": "lane-support", "title": "Garanti gäller?" },
    { "id": "step-2a", "type": "step", "laneId": "lane-backoffice", "title": "Godkänn reklamation" },
    { "id": "step-2b", "type": "step", "laneId": "lane-support", "title": "Avslå reklamation" },
    { "id": "end", "type": "end", "laneId": "lane-customer", "title": "Ärende avslutat" }
  ],
  "edges": [
    { "id": "e1", "from": "start", "to": "step-1", "type": "normal" },
    { "id": "e2", "from": "step-1", "to": "decision-1", "type": "normal" },
    { "id": "e3", "from": "decision-1", "to": "step-2a", "type": "decision_yes", "label": "Ja" },
    { "id": "e4", "from": "decision-1", "to": "step-2b", "type": "decision_no", "label": "Nej" },
    { "id": "e5", "from": "step-2a", "to": "end", "type": "normal" },
    { "id": "e6", "from": "step-2b", "to": "end", "type": "normal" }
  ],
  "metadata": { "language": "sv", "version": 1 }
}
```

---

## Exempel 2: Incidentflöde (IT)

```json
{
  "lanes": [
    { "id": "lane-user", "name": "Användare", "order": 0 },
    { "id": "lane-l1", "name": "L1 Support", "order": 1 },
    { "id": "lane-l2", "name": "L2 Tekniker", "order": 2 }
  ],
  "nodes": [
    { "id": "start", "type": "start", "laneId": "lane-user", "title": "Incident rapporterad" },
    { "id": "step-1", "type": "step", "laneId": "lane-l1", "title": "Klassificera incident" },
    { "id": "decision-1", "type": "decision", "laneId": "lane-l1", "title": "Kan L1 lösa?" },
    { "id": "step-2", "type": "step", "laneId": "lane-l1", "title": "Åtgärda och stäng" },
    { "id": "step-3", "type": "step", "laneId": "lane-l2", "title": "Eskalera till L2" },
    { "id": "step-4", "type": "step", "laneId": "lane-l2", "title": "Teknisk åtgärd" },
    { "id": "end", "type": "end", "laneId": "lane-user", "title": "Incident löst" }
  ],
  "edges": [
    { "id": "e1", "from": "start", "to": "step-1", "type": "normal" },
    { "id": "e2", "from": "step-1", "to": "decision-1", "type": "normal" },
    { "id": "e3", "from": "decision-1", "to": "step-2", "type": "decision_yes", "label": "Ja" },
    { "id": "e4", "from": "decision-1", "to": "step-3", "type": "decision_no", "label": "Nej" },
    { "id": "e5", "from": "step-2", "to": "end", "type": "normal" },
    { "id": "e6", "from": "step-3", "to": "step-4", "type": "escalation" },
    { "id": "e7", "from": "step-4", "to": "end", "type": "normal" }
  ],
  "metadata": { "domain": "IT", "language": "sv", "version": 1 }
}
```

---

## Exempel 3: Teams-protokoll → Workflow

**Input (Teams-protokoll):**
> "Vi beslutade att Anna tar emot förfrågningar, Erik granskar vid belopp över 50k, 
> och Maria godkänner slutligt. Om avslag ska kund meddelas inom 24h."

**Output (WorkflowSpec):**

```json
{
  "lanes": [
    { "id": "lane-anna", "name": "Anna", "order": 0 },
    { "id": "lane-erik", "name": "Erik", "order": 1 },
    { "id": "lane-maria", "name": "Maria", "order": 2 }
  ],
  "nodes": [
    { "id": "start", "type": "start", "laneId": "lane-anna", "title": "Förfrågan inkommer" },
    { "id": "step-1", "type": "step", "laneId": "lane-anna", "title": "Ta emot förfrågan" },
    { "id": "decision-1", "type": "decision", "laneId": "lane-anna", "title": "Belopp > 50k?" },
    { "id": "step-2", "type": "step", "laneId": "lane-erik", "title": "Granskning" },
    { "id": "step-3", "type": "step", "laneId": "lane-maria", "title": "Slutgiltigt godkännande" },
    { "id": "decision-2", "type": "decision", "laneId": "lane-maria", "title": "Godkänd?" },
    { "id": "step-4", "type": "step", "laneId": "lane-anna", "title": "Meddela kund om avslag (24h)" },
    { "id": "end", "type": "end", "laneId": "lane-anna", "title": "Ärende klart" }
  ],
  "edges": [
    { "id": "e1", "from": "start", "to": "step-1", "type": "normal" },
    { "id": "e2", "from": "step-1", "to": "decision-1", "type": "normal" },
    { "id": "e3", "from": "decision-1", "to": "step-2", "type": "decision_yes", "label": "Ja" },
    { "id": "e4", "from": "decision-1", "to": "step-3", "type": "decision_no", "label": "Nej" },
    { "id": "e5", "from": "step-2", "to": "step-3", "type": "normal" },
    { "id": "e6", "from": "step-3", "to": "decision-2", "type": "normal" },
    { "id": "e7", "from": "decision-2", "to": "end", "type": "decision_yes", "label": "Ja" },
    { "id": "e8", "from": "decision-2", "to": "step-4", "type": "decision_no", "label": "Nej" },
    { "id": "e9", "from": "step-4", "to": "end", "type": "normal" }
  ],
  "metadata": { "language": "sv", "version": 1 }
}
```
