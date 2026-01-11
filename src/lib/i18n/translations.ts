export type Translations = typeof translations.en;

export const translations = {
    en: {
        app: {
            name: 'Antigravity',
            subtitle: 'Workflow Compiler',
            theme: 'Toggle theme',
            language: 'Change language',
        },
        chat: {
            placeholder: {
                new: 'Describe your workflow...',
                edit: 'Describe changes...',
            },
            send: 'Send',
            hint: 'to send',
            command_hint: 'Type / for templates',
            generating: 'Generating...',
            welcome: 'Hi! Describe the workflow you want to create, or paste meeting notes and I will generate a visual flow for you.',
            empty_patterns: 'No matching patterns',
            select_pattern: 'SELECT WORKFLOW PATTERN',
        },
        status: {
            nodes: 'nodes',
            lanes: 'lanes',
            no_workflow: 'No workflow',
        },
        landing: {
            title: 'Paste your meeting notes.',
            subtitle: 'I’ll turn them into a clear decision & action flow.',
            placeholder: 'Paste meeting notes here...',
        },
        actions: {
            apply: 'Apply',
            discard: 'Discard',
            undo: 'Undo (Cmd+Z)',
            redo: 'Redo (Cmd+Shift+Z)',
            preview: 'Preview changes',
            applied: 'Changes applied and synchronized',
            discarded: 'Proposal discarded',
        },
    },
    sv: {
        app: {
            name: 'Antigravity',
            subtitle: 'Workflow Compiler',
            theme: 'Byt tema',
            language: 'Byt språk',
        },
        chat: {
            placeholder: {
                new: 'Beskriv ditt workflow...',
                edit: 'Beskriv ändringar...',
            },
            send: 'Skicka',
            hint: 'för att skicka',
            command_hint: 'Skriv / för mallar',
            generating: 'Genererar...',
            welcome: 'Hej! Beskriv det workflow du vill skapa, eller klistra in ett mötesprotokoll så genererar jag ett visuellt flöde.',
            empty_patterns: 'Inga matchande patterns',
            select_pattern: 'VÄLJ WORKFLOW PATTERN',
        },
        status: {
            nodes: 'noder',
            lanes: 'lanes',
            no_workflow: 'Inget workflow',
        },
        landing: {
            title: 'Klistra in dina mötesanteckningar.',
            subtitle: 'Jag omvandlar dem till ett tydligt besluts- och åtgärdsflöde.',
            placeholder: 'Klistra in mötesanteckningar här...',
        },
        actions: {
            apply: 'Tillämpa',
            discard: 'Avbryt',
            undo: 'Ångra (Cmd+Z)',
            redo: 'Gör om (Cmd+Shift+Z)',
            preview: 'Förhandsgranska ändringar',
            applied: 'Ändringar tillämpade och synkroniserade',
            discarded: 'Förslag kasserat',
        },
    },
};
