export interface WorkflowPattern {
    id: string;
    name: string;
    description: string;
    command: string;
    template: string;
}

export const WORKFLOW_PATTERNS: WorkflowPattern[] = [
    {
        id: 'linear',
        name: 'Linear Process',
        description: 'Simple sequence of steps, e.g. checklists.',
        command: 'linear',
        template: 'Create a linear process for: ',
    },
    {
        id: 'decision',
        name: 'Decision Flow',
        description: 'Logic with yes/no paths.',
        command: 'decision',
        template: 'Create a decision flow for: ',
    },
    {
        id: 'swimlane',
        name: 'Swimlane Process',
        description: 'Flow with multiple actors/roles.',
        command: 'swimlane',
        template: 'Create a swimlane flow for actors [X, Y] handling process: ',
    },
    {
        id: 'incident',
        name: 'Incident Timeline',
        description: 'Incident handling and root cause analysis.',
        command: 'incident',
        template: 'Create an incident flow for event: ',
    },
    {
        id: 'journey',
        name: 'Customer Journey',
        description: 'Map customer experience phases.',
        command: 'journey',
        template: 'Create a customer journey map for: ',
    },
    {
        id: 'retro',
        name: 'Retrospective',
        description: 'Structure feedback (Start/Stop/Continue).',
        command: 'retro',
        template: 'Create a retrospective board for: ',
    },
    {
        id: 'raci',
        name: 'RACI Process',
        description: 'Define Responsible, Accountable, Consulted workflows.',
        command: 'raci',
        template: 'Create a RACI process flow for: ',
    },
];
