'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { WorkflowCanvas } from '@/components/WorkflowCanvas';
import { useTheme } from '@/lib/theme';
import {
  AntigravityIcon,
  WorkflowIcon,
  SendIcon,
  SunIcon,
  MoonIcon,
  SparkleIcon,
  CheckIcon,
  CloseIcon,
  LoadingDots,
  UserIcon,
  BotIcon,
  UndoIcon,
  RedoIcon,
} from '@/components/icons';
import type { WorkflowSpec, DiffSummary } from '@/lib/schema';
import { useYjs } from '@/components/YjsProvider';
import { syncYjsToSpec, syncSpecToYjs } from '@/lib/yjs-utils';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

interface ProposalState {
  spec: WorkflowSpec;
  diffSummary: DiffSummary;
  assumptions?: string[];
}

export default function Home() {
  const { theme, toggleTheme } = useTheme();
  const { doc, status, undo, redo, canUndo, canRedo } = useYjs();
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hej! Beskriv det workflow du vill skapa, eller klistra in ett mötesprotokoll så genererar jag ett visuellt flöde.',
      timestamp: new Date(),
    },
  ]);

  const [workflow, setWorkflow] = useState<WorkflowSpec | null>(null);
  const [proposal, setProposal] = useState<ProposalState | null>(null);

  const isDark = theme === 'dark';

  // Sync with Yjs
  useEffect(() => {
    if (!doc) return;

    const updateWorkflow = () => {
      const spec = syncYjsToSpec(doc);
      setWorkflow(spec);
    };

    // Initial sync
    updateWorkflow();

    // Listen for updates
    doc.on('update', updateWorkflow);

    return () => {
      doc.off('update', updateWorkflow);
    };
  }, [doc]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Global keyboard shortcuts for Undo/Redo
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Cmd+Z or Ctrl+Z
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        if (e.shiftKey) {
          e.preventDefault();
          redo();
        } else {
          e.preventDefault();
          undo();
        }
      }
      // Cmd+Y or Ctrl+Y (Windows Redo standard)
      if ((e.metaKey || e.ctrlKey) && e.key === 'y') {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [undo, redo]);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 160)}px`;
    }
  }, [prompt]);

  const addMessage = useCallback((role: Message['role'], content: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        role,
        content,
        timestamp: new Date(),
      },
    ]);
  }, []);

  const handleSubmit = async () => {
    if (!prompt.trim() || isGenerating) return;

    const userPrompt = prompt.trim();
    setPrompt('');
    addMessage('user', userPrompt);
    setIsGenerating(true);

    try {
      const isRefine = workflow !== null;
      const endpoint = isRefine ? '/api/workflow/refine' : '/api/workflow/compile';
      const body = isRefine
        ? { spec: workflow, instruction: userPrompt }
        : { prompt: userPrompt };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ett fel uppstod');
      }

      setProposal({
        spec: data.workflowSpec,
        diffSummary: data.diffSummary,
        assumptions: data.assumptions,
      });

      let msg = `${data.diffSummary.summary}`;
      if (data.diffSummary.added?.length > 0) {
        msg += `\n\nLade till: ${data.diffSummary.added.join(', ')}`;
      }
      addMessage('assistant', msg);

    } catch (error) {
      const message = error instanceof Error ? error.message : 'Ett fel uppstod';
      addMessage('assistant', `Fel: ${message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApply = () => {
    if (!proposal || !doc) return;
    syncSpecToYjs(doc, proposal.spec);
    setProposal(null);
    addMessage('system', 'Ändringar tillämpade och synkroniserade');
  };

  const handleDiscard = () => {
    setProposal(null);
    addMessage('system', 'Förslag kasserat');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className={`h-screen w-screen flex ${isDark ? 'bg-[#0a0f1a]' : 'bg-slate-50'}`}>
      {/* Sidebar */}
      <aside className={`w-[420px] flex flex-col ${isDark ? 'bg-[#0d1424] border-r border-white/[0.06]' : 'bg-white border-r border-slate-200'}`}>

        {/* Header */}
        <header className={`px-5 py-4 flex items-center justify-between ${isDark ? 'border-b border-white/[0.06]' : 'border-b border-slate-100'}`}>
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center shadow-lg shadow-teal-500/20">
                <AntigravityIcon className="text-white" size={22} />
              </div>
              <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#0d1424] transition-colors duration-300 ${status === 'connected' ? 'bg-emerald-400' :
                status === 'connecting' ? 'bg-amber-400' : 'bg-rose-500'
                }`} />
            </div>
            <div>
              <h1 className={`text-[15px] font-semibold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Antigravity
              </h1>
              <div className="flex items-center gap-1.5">
                <WorkflowIcon className={isDark ? 'text-slate-500' : 'text-slate-400'} size={12} />
                <span className={`text-[11px] font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                  Workflow Compiler
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={toggleTheme}
            className={`p-2.5 rounded-xl transition-all duration-200 ${isDark
              ? 'hover:bg-white/[0.04] text-slate-400 hover:text-slate-300'
              : 'hover:bg-slate-100 text-slate-500 hover:text-slate-700'
              }`}
            aria-label="Byt tema"
          >
            {isDark ? <SunIcon size={18} /> : <MoonIcon size={18} />}
          </button>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-5 space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className="flex gap-3">
                {/* Avatar */}
                <div className={`w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center ${msg.role === 'user'
                  ? 'bg-gradient-to-br from-teal-400 to-cyan-500'
                  : msg.role === 'assistant'
                    ? isDark ? 'bg-white/[0.06]' : 'bg-slate-100'
                    : 'bg-transparent'
                  }`}>
                  {msg.role === 'user' && <UserIcon className="text-white" size={14} />}
                  {msg.role === 'assistant' && <BotIcon className={isDark ? 'text-slate-400' : 'text-slate-500'} size={14} />}
                  {msg.role === 'system' && <SparkleIcon className={isDark ? 'text-teal-400' : 'text-teal-500'} size={14} />}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pt-0.5">
                  <p className={`text-[13px] leading-relaxed whitespace-pre-wrap ${msg.role === 'system'
                    ? isDark ? 'text-slate-500 italic' : 'text-slate-400 italic'
                    : isDark ? 'text-slate-300' : 'text-slate-700'
                    }`}>
                    {msg.content}
                  </p>
                </div>
              </div>
            ))}

            {/* Loading state */}
            {isGenerating && (
              <div className="flex gap-3">
                <div className={`w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center ${isDark ? 'bg-white/[0.06]' : 'bg-slate-100'}`}>
                  <BotIcon className={isDark ? 'text-slate-400' : 'text-slate-500'} size={14} />
                </div>
                <div className="flex items-center gap-2 pt-1.5">
                  <LoadingDots className={isDark ? 'text-teal-400' : 'text-teal-500'} />
                  <span className={`text-[12px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    Genererar...
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Preview Actions */}
        {proposal && (
          <div className={`mx-5 mb-4 p-4 rounded-2xl ${isDark ? 'bg-amber-500/[0.08] border border-amber-500/20' : 'bg-amber-50 border border-amber-200'}`}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span className={`text-[12px] font-medium ${isDark ? 'text-amber-300' : 'text-amber-700'}`}>
                Förhandsgranska ändringar
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleApply}
                className="flex-1 h-10 flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-green-500 text-white text-[13px] font-medium rounded-xl hover:from-emerald-600 hover:to-green-600 transition-all shadow-lg shadow-emerald-500/20"
              >
                <CheckIcon size={14} />
                Tillämpa
              </button>
              <button
                onClick={handleDiscard}
                className={`flex-1 h-10 flex items-center justify-center gap-2 text-[13px] font-medium rounded-xl transition-all ${isDark
                  ? 'bg-white/[0.04] text-slate-300 hover:bg-white/[0.08]'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
              >
                <CloseIcon size={14} />
                Avbryt
              </button>
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className={`p-5 ${isDark ? 'border-t border-white/[0.06]' : 'border-t border-slate-100'}`}>
          <div className={`relative rounded-2xl transition-all duration-200 ${isDark
            ? 'bg-white/[0.03] border border-white/[0.06] focus-within:border-teal-500/40 focus-within:bg-white/[0.04]'
            : 'bg-slate-50 border border-slate-200 focus-within:border-teal-500 focus-within:bg-white'
            }`}>
            <textarea
              ref={textareaRef}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={workflow ? 'Beskriv ändringar...' : 'Beskriv ditt workflow...'}
              className={`w-full min-h-[52px] max-h-[160px] px-4 py-3.5 pr-12 bg-transparent text-[13px] leading-relaxed resize-none focus:outline-none ${isDark
                ? 'text-slate-200 placeholder:text-slate-600'
                : 'text-slate-800 placeholder:text-slate-400'
                }`}
              disabled={isGenerating}
              rows={1}
            />
            <button
              onClick={handleSubmit}
              disabled={!prompt.trim() || isGenerating}
              className={`absolute right-2 bottom-2 w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-200 ${prompt.trim() && !isGenerating
                ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40'
                : isDark
                  ? 'bg-white/[0.04] text-slate-600 cursor-not-allowed'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
            >
              <SendIcon size={16} />
            </button>
          </div>

          {/* Keyboard hint */}
          <div className={`mt-2.5 flex items-center justify-center gap-1.5 ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
            <span className="text-[11px]">Tryck</span>
            <kbd className={`px-1.5 py-0.5 text-[10px] font-medium rounded ${isDark ? 'bg-white/[0.04] border border-white/[0.08]' : 'bg-slate-100 border border-slate-200'}`}>
              Enter
            </kbd>
            <span className="text-[11px]">för att skicka</span>
          </div>
        </div>
      </aside>

      {/* Canvas */}
      <main className="flex-1 relative">
        <WorkflowCanvas
          spec={workflow}
          previewSpec={proposal?.spec}
          theme={theme}
        />

        {/* Status bar & Controls */}
        <div className={`absolute bottom-4 left-4 flex items-center gap-3 p-1.5 rounded-xl border backdrop-blur-sm shadow-sm ${isDark ? 'bg-black/40 border-white/10' : 'bg-white/80 border-slate-200/50'}`}>

          <div className="flex items-center gap-2 pl-2 pr-1">
            <div className={`w-1.5 h-1.5 rounded-full ${workflow ? 'bg-emerald-400' : 'bg-slate-500'}`} />
            <span className={`text-[11px] font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {workflow ? `${workflow.nodes.length} noder` : '0 noder'}
            </span>
          </div>

          <div className={`w-px h-3 ${isDark ? 'bg-white/10' : 'bg-slate-200'}`} />

          <div className="flex items-center gap-0.5">
            <button
              onClick={undo}
              disabled={!canUndo}
              className={`p-1.5 rounded-lg transition-colors ${canUndo
                ? isDark ? 'hover:bg-white/10 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'
                : isDark ? 'text-slate-700 cursor-not-allowed' : 'text-slate-300 cursor-not-allowed'
                }`}
              title="Ångra (Cmd+Z)"
            >
              <UndoIcon size={14} />
            </button>
            <button
              onClick={redo}
              disabled={!canRedo}
              className={`p-1.5 rounded-lg transition-colors ${canRedo
                ? isDark ? 'hover:bg-white/10 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'
                : isDark ? 'text-slate-700 cursor-not-allowed' : 'text-slate-300 cursor-not-allowed'
                }`}
              title="Gör om (Cmd+Shift+Z)"
            >
              <RedoIcon size={14} />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
