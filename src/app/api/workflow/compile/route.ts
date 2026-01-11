import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { WorkflowSpecSchema, type WorkflowSpec, type DiffSummary } from '@/lib/schema';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `Du är en expert-workflow-kompilator. Din uppgift är att konvertera användarens beskrivning eller mötesprotokoll till ett strukturerat workflow.

Du ska returnera ett JSON-objekt med följande struktur:
{
  "workflowSpec": {
    "lanes": [{ "id": "lane-xxx", "name": "Rollnamn", "order": 0 }],
    "nodes": [{ "id": "node-xxx", "type": "start|end|step|decision", "laneId": "lane-xxx", "title": "Titel", "description": "Beskrivning" }],
    "edges": [{ "id": "edge-xxx", "from": "node-id", "to": "node-id", "type": "normal|decision_yes|decision_no|loop|escalation", "label": "Etikett" }],
    "metadata": { "language": "sv", "version": 1 }
  },
  "diffSummary": {
    "added": ["Lista av saker som lades till"],
    "removed": [],
    "modified": [],
    "summary": "Kort sammanfattning av vad som skapades"
  },
  "assumptions": ["Lista av antaganden du gjorde"]
}

Regler:
1. Varje workflow MÅSTE ha exakt en "start"-nod och minst en "end"-nod
2. Använd lanes för att representera roller/aktörer/avdelningar
3. Beslut (decision) ska ha två utgående edges: decision_yes och decision_no
4. Använd svenska titlar och beskrivningar
5. Generera unika ID:n med prefix (lane-, node-, edge-)
6. Om input är ett mötesprotokoll, extrahera beslut, actions och ansvar
7. Returnera ENDAST valid JSON, ingen annan text`;

interface CompileRequest {
    prompt: string;
    context?: string;
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json() as CompileRequest;

        if (!body.prompt || body.prompt.trim().length === 0) {
            return NextResponse.json(
                { error: 'Prompt krävs' },
                { status: 400 }
            );
        }

        // Rate limiting check (basic - should be enhanced for production)
        const promptLength = body.prompt.length + (body.context?.length || 0);
        if (promptLength > 10000) {
            return NextResponse.json(
                { error: 'Input för lång (max 10000 tecken)' },
                { status: 400 }
            );
        }

        const userMessage = body.context
            ? `Kontext: ${body.context}\n\nPrompt: ${body.prompt}`
            : body.prompt;

        const completion = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                { role: 'user', content: userMessage },
            ],
            temperature: 0.7,
            response_format: { type: 'json_object' },
        });

        const content = completion.choices[0]?.message?.content;

        if (!content) {
            return NextResponse.json(
                { error: 'Inget svar från AI' },
                { status: 500 }
            );
        }

        // Parse and validate the response
        let parsed: { workflowSpec: WorkflowSpec; diffSummary: DiffSummary; assumptions?: string[] };
        try {
            parsed = JSON.parse(content);
        } catch {
            return NextResponse.json(
                { error: 'Kunde inte tolka AI-svar som JSON' },
                { status: 500 }
            );
        }

        // Schema validation
        const validation = WorkflowSpecSchema.safeParse(parsed.workflowSpec);
        if (!validation.success) {
            console.error('Schema validation failed:', validation.error);
            return NextResponse.json(
                {
                    error: 'Workflow-specifikationen är inte valid',
                    details: validation.error.issues,
                },
                { status: 500 }
            );
        }

        return NextResponse.json({
            workflowSpec: validation.data,
            diffSummary: parsed.diffSummary || {
                added: ['Nytt workflow skapat'],
                removed: [],
                modified: [],
                summary: 'Workflow genererat från prompt',
            },
            assumptions: parsed.assumptions || [],
        });
    } catch (error) {
        console.error('Compile error:', error);
        return NextResponse.json(
            { error: 'Ett fel uppstod vid kompilering' },
            { status: 500 }
        );
    }
}
