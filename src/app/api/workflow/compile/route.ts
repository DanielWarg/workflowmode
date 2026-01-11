import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { WorkflowSpecSchema, type WorkflowSpec, type DiffSummary } from '@/lib/schema';
import { BASE_SYSTEM_PROMPT, PATTERN_INSTRUCTIONS } from '@/lib/ai/prompts';
import { MEETING_SYSTEM_PROMPT } from '@/lib/ai/meeting-prompts';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

interface CompileRequest {
    prompt: string;
    context?: string;
    pattern?: string;
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json() as CompileRequest;

        if (!body.prompt || body.prompt.trim().length === 0) {
            return NextResponse.json(
                { error: 'Prompt required' },
                { status: 400 }
            );
        }

        // Rate limiting check
        const promptLength = body.prompt.length + (body.context?.length || 0);
        if (promptLength > 10000) {
            return NextResponse.json(
                { error: 'Input too long (max 10000 chars)' },
                { status: 400 }
            );
        }

        let systemPrompt = BASE_SYSTEM_PROMPT;

        if (body.pattern && PATTERN_INSTRUCTIONS[body.pattern]) {
            systemPrompt += `\n\n${PATTERN_INSTRUCTIONS[body.pattern]}`;
        } else {
            // Auto-detect meeting notes: crude heuristic (multi-line input)
            const isMeetingNotes = body.prompt.split('\n').filter(line => line.trim().length > 0).length >= 3;
            if (isMeetingNotes) {
                console.log('Detected Meeting Notes mode');
                systemPrompt = MEETING_SYSTEM_PROMPT;
            }
        }

        const userMessage = body.context
            ? `Context: ${body.context}\n\nPrompt: ${body.prompt}`
            : body.prompt;

        const completion = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userMessage },
            ],
            temperature: 0.7,
            response_format: { type: 'json_object' },
        });

        const content = completion.choices[0]?.message?.content;

        if (!content) {
            return NextResponse.json(
                { error: 'No response from AI' },
                { status: 500 }
            );
        }

        // Parse and validate the response
        let parsed: { workflowSpec: WorkflowSpec; diffSummary: DiffSummary; assumptions?: string[] };
        try {
            parsed = JSON.parse(content);
        } catch {
            return NextResponse.json(
                { error: 'Failed to parse AI response as JSON' },
                { status: 500 }
            );
        }

        // Schema validation
        const validation = WorkflowSpecSchema.safeParse(parsed.workflowSpec);
        if (!validation.success) {
            console.error('Schema validation failed:', validation.error);
            return NextResponse.json(
                {
                    error: 'Workflow spec validation failed',
                    details: validation.error.issues,
                },
                { status: 500 }
            );
        }

        return NextResponse.json({
            workflowSpec: validation.data,
            intel: {
                decisionCount: validation.data.nodes.filter(n => n.type === 'decision').length,
                actionCount: validation.data.nodes.filter(n => n.type === 'step').length,
            },
            diffSummary: parsed.diffSummary || {
                added: ['New workflow created'],
                removed: [],
                modified: [],
                summary: 'Workflow generated from prompt',
            },
            assumptions: parsed.assumptions || [],
        });
    } catch (error) {
        console.error('Compile error:', error);
        return NextResponse.json(
            { error: 'Internal server error during compilation' },
            { status: 500 }
        );
    }
}
