import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { WorkflowSpecSchema, type WorkflowSpec, type DiffSummary } from '@/lib/schema';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `Du är en expert-workflow-modifierare. Din uppgift är att modifiera ett befintligt workflow baserat på användarens instruktion.

Du får:
1. Det nuvarande workflowet (JSON)
2. En instruktion om vad som ska ändras

Du ska returnera ett JSON-objekt med följande struktur:
{
  "workflowSpec": { /* Hela det uppdaterade workflowet */ },
  "diffSummary": {
    "added": ["Lista av saker som lades till"],
    "removed": ["Lista av saker som togs bort"],
    "modified": ["Lista av saker som modifierades"],
    "summary": "Kort sammanfattning av ändringarna"
  }
}

Regler:
1. Behåll alla befintliga ID:n som inte ändras
2. Generera nya ID:n för nya noder/edges med prefix (node-, edge-)
3. Varje workflow MÅSTE ha exakt en "start"-nod och minst en "end"-nod
4. Beslut (decision) ska ha två utgående edges: decision_yes och decision_no
5. Returnera ENDAST valid JSON, ingen annan text
6. Om instruktionen är otydlig, gör rimliga antaganden`;

interface RefineRequest {
    spec: WorkflowSpec;
    instruction: string;
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json() as RefineRequest;

        if (!body.spec || !body.instruction) {
            return NextResponse.json(
                { error: 'Spec och instruktion krävs' },
                { status: 400 }
            );
        }

        // Validate input spec
        const inputValidation = WorkflowSpecSchema.safeParse(body.spec);
        if (!inputValidation.success) {
            return NextResponse.json(
                { error: 'Ogiltig workflow-spec i input' },
                { status: 400 }
            );
        }

        const userMessage = `Nuvarande workflow:
\`\`\`json
${JSON.stringify(body.spec, null, 2)}
\`\`\`

Instruktion: ${body.instruction}`;

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

        let parsed: { workflowSpec: WorkflowSpec; diffSummary: DiffSummary };
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
                added: [],
                removed: [],
                modified: ['Workflow uppdaterat'],
                summary: 'Workflow modifierat enligt instruktion',
            },
        });
    } catch (error) {
        console.error('Refine error:', error);
        return NextResponse.json(
            { error: 'Ett fel uppstod vid modifiering' },
            { status: 500 }
        );
    }
}
