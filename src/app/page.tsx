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
  TrashIcon,
} from '@/components/icons';
import type { WorkflowSpec, DiffSummary, AIWorkflowIntel, Node } from '@/lib/schema';
import { useYjs } from '@/components/YjsProvider';
import { syncYjsToSpec, syncSpecToYjs } from '@/lib/yjs-utils';
import { WORKFLOW_PATTERNS, type WorkflowPattern } from '@/lib/patterns';
import { useLanguage } from '@/components/LanguageProvider';
import { UserAvatars } from '@/components/UserAvatars';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

interface ProposalState {
  spec: WorkflowSpec;
  diffSummary: DiffSummary;
  intel?: AIWorkflowIntel;
  assumptions?: string[];
}

export default function Home() {
  const { theme, toggleTheme } = useTheme();
  const { t, language, setLanguage } = useLanguage();
  const { doc, status, undo, redo, canUndo, canRedo } = useYjs();
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Command Palette State
  const [showCommands, setShowCommands] = useState(false);
  const [commandFilter, setCommandFilter] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [activePatternId, setActivePatternId] = useState<string | null>(null);
  const [fitViewTrigger, setFitViewTrigger] = useState(0);

  const filteredPatterns = WORKFLOW_PATTERNS.filter(p =>
    p.command.toLowerCase().startsWith(commandFilter.toLowerCase()) ||
    p.name.toLowerCase().includes(commandFilter.toLowerCase())
  );

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setPrompt(val);
    if (val.trim() === '') setActivePatternId(null);

    const words = val.split('\n');
    const lastLine = words[words.length - 1];
    const lastWord = lastLine.split(' ').pop() || '';

    if (lastWord.startsWith('/') && lastWord.length > 0) {
      setShowCommands(true);
      setCommandFilter(lastWord.slice(1));
      setSelectedIndex(0);
    } else {
      setShowCommands(false);
    }
  };

  const selectPattern = (pattern: WorkflowPattern) => {
    const val = prompt;
    const lastSlashIndex = val.lastIndexOf('/');
    if (lastSlashIndex !== -1) {
      const newText = val.substring(0, lastSlashIndex) + pattern.template;
      setPrompt(newText);
      setActivePatternId(pattern.id);
      setShowCommands(false);

      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = newText.length;
        }
      }, 10);
    }
  };

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello', // Placeholder, updated by effect
      timestamp: new Date(),
    },
  ]);

  useEffect(() => {
    setMessages(prev => {
      if (prev.length === 1 && prev[0].role === 'assistant') {
        return [{ ...prev[0], content: t.chat.welcome }];
      }
      return prev;
    });
  }, [t.chat.welcome]);

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
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
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

  // Focus on mount if no workflow
  useEffect(() => {
    if (!workflow && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [workflow]);

  const handleNodesDelete = useCallback((deletedNodes: Node[]) => {
    if (!workflow || !doc) return;
    const deletedIds = deletedNodes.map(n => n.id);

    const newNodes = workflow.nodes.filter(n => !deletedIds.includes(n.id));
    const newEdges = workflow.edges.filter(e => !deletedIds.includes(e.from) && !deletedIds.includes(e.to));

    const newSpec = {
      ...workflow,
      nodes: newNodes,
      edges: newEdges
    };

    syncSpecToYjs(doc, newSpec);
  }, [workflow, doc]);

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
        : { prompt: userPrompt, pattern: activePatternId || undefined };

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
        intel: data.intel,
        assumptions: data.assumptions,
      });
      setFitViewTrigger(Date.now());

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

  const handleClear = () => {
    if (confirm(t.actions.discard + '?')) {
      if (doc) {
        syncSpecToYjs(doc, { nodes: [], edges: [], lanes: [], metadata: {} });
        setWorkflow(null);
        setProposal(null);
        addMessage('system', 'Canvas rensad.');
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (showCommands) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % filteredPatterns.length);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredPatterns.length) % filteredPatterns.length);
        return;
      }
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        if (filteredPatterns[selectedIndex]) {
          selectPattern(filteredPatterns[selectedIndex]);
        }
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        setShowCommands(false);
        return;
      }
    }

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className={`fixed inset-0 flex overflow-hidden ${isDark ? 'bg-[#0a0f1a]' : 'bg-slate-50'}`}>
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
                {t.app.name}
              </h1>
              <div className="flex items-center gap-1.5">
                <WorkflowIcon className={isDark ? 'text-slate-500' : 'text-slate-400'} size={12} />
                <span className={`text-[11px] font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                  {t.app.subtitle}
                </span>
              </div>
            </div>
          </div>

          {workflow && (
            <div className="flex items-center gap-2 animate-in fade-in duration-500">
              <UserAvatars />
              <button
                onClick={() => setLanguage(language === 'en' ? 'sv' : 'en')}
                className={`px-2 py-1 text-[11px] font-medium rounded-lg transition-all ${isDark
                  ? 'hover:bg-white/[0.04] text-slate-400 hover:text-slate-300'
                  : 'hover:bg-slate-100 text-slate-500 hover:text-slate-700'
                  }`}
              >
                {language.toUpperCase()}
              </button>
              <button
                onClick={toggleTheme}
                className={`p-2.5 rounded-xl transition-all duration-200 ${isDark
                  ? 'hover:bg-white/[0.04] text-slate-400 hover:text-slate-300'
                  : 'hover:bg-slate-100 text-slate-500 hover:text-slate-700'
                  }`}
                aria-label={t.app.theme}
              >
                {isDark ? <SunIcon size={18} /> : <MoonIcon size={18} />}
              </button>
            </div>
          )}
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
                    {t.chat.generating}
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
                {t.actions.preview}
              </span>
              {proposal.intel && (proposal.intel.decisionCount > 0 || proposal.intel.actionCount > 0) && (
                <div className={`flex items-center gap-3 ml-2 pl-3 border-l ${isDark ? 'border-amber-500/20' : 'border-amber-200'}`}>
                  {proposal.intel.decisionCount > 0 && (
                    <span className={`text-[11px] font-medium flex items-center gap-1 ${isDark ? 'text-amber-300/80' : 'text-amber-800/70'}`}>
                      <span className="text-amber-400">◆</span> {proposal.intel.decisionCount} Decisions
                    </span>
                  )}
                  {proposal.intel.actionCount > 0 && (
                    <span className={`text-[11px] font-medium flex items-center gap-1 ${isDark ? 'text-amber-300/80' : 'text-amber-800/70'}`}>
                      <span className="text-amber-400">⚡️</span> {proposal.intel.actionCount} Actions
                    </span>
                  )}
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleApply}
                className="flex-1 h-10 flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-green-500 text-white text-[13px] font-medium rounded-xl hover:from-emerald-600 hover:to-green-600 transition-all shadow-lg shadow-emerald-500/20"
              >
                <CheckIcon size={14} />
                {t.actions.apply}
              </button>
              <button
                onClick={handleDiscard}
                className={`flex-1 h-10 flex items-center justify-center gap-2 text-[13px] font-medium rounded-xl transition-all ${isDark
                  ? 'bg-white/[0.04] text-slate-300 hover:bg-white/[0.08]'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
              >
                <CloseIcon size={14} />
                {t.actions.discard}
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

            {/* Command Palette */}
            {showCommands && (
              <div className={`absolute left-4 bottom-[calc(100%+8px)] mb-2 z-50 w-64 rounded-xl shadow-2xl overflow-hidden border transform transition-all duration-200 origin-bottom ${isDark ? 'bg-[#0d1424] border-white/10 shadow-black/50' : 'bg-white border-slate-200 shadow-slate-200/50'
                }`}>
                <div className={`px-3 py-2 text-[10px] font-bold uppercase tracking-wider border-b ${isDark ? 'text-slate-500 bg-white/[0.02] border-white/[0.04]' : 'text-slate-400 bg-slate-50 border-slate-100'
                  }`}>
                  {t.chat.select_pattern}
                </div>
                <div className="max-h-[200px] overflow-y-auto py-1">
                  {filteredPatterns.length > 0 ? filteredPatterns.map((pattern, i) => (
                    <button
                      key={pattern.id}
                      onClick={() => selectPattern(pattern)}
                      className={`w-full text-left px-3 py-2.5 flex flex-col gap-0.5 transition-colors ${i === selectedIndex
                        ? isDark ? 'bg-teal-500/10 text-teal-400' : 'bg-teal-50 text-teal-700'
                        : isDark ? 'text-slate-300 hover:bg-white/[0.04]' : 'text-slate-700 hover:bg-slate-50'
                        }`}
                    >
                      <span className="text-[13px] font-medium flex items-center gap-2">
                        <WorkflowIcon size={12} className={i === selectedIndex ? 'text-teal-500' : 'opacity-40'} />
                        /{pattern.command}
                      </span>
                      <span className={`text-[11px] truncate ${i === selectedIndex ? 'text-teal-500/80' : 'text-slate-500'
                        }`}>
                        {pattern.name}
                      </span>
                    </button>
                  )) : (
                    <div className={`px-3 py-4 text-center text-[12px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                      {t.chat.empty_patterns}
                    </div>
                  )}
                </div>
              </div>
            )}
            <textarea
              ref={textareaRef}
              value={prompt}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              placeholder={workflow ? t.chat.placeholder.edit : t.landing.placeholder}
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
              title={t.chat.send}
            >
              <SendIcon size={16} />
            </button>
          </div>

          {/* Keyboard hint */}
          <div className={`mt-2.5 flex items-center justify-center gap-1.5 ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
            <kbd className={`px-1.5 py-0.5 text-[10px] font-medium rounded ${isDark ? 'bg-white/[0.04] border border-white/[0.08]' : 'bg-slate-100 border border-slate-200'}`}>
              Enter
            </kbd>
            <span className="text-[11px]">{t.chat.hint}</span>
            <span className="mx-1 opacity-40">•</span>
            <span className="text-[11px] opacity-75">{t.chat.command_hint}</span>
          </div>
        </div>
      </aside>

      {/* Canvas */}
      <main className="flex-1 relative">
        <WorkflowCanvas
          spec={workflow}
          previewSpec={proposal?.spec}
          onNodesDelete={handleNodesDelete}
          theme={theme}
          fitViewTrigger={fitViewTrigger}
        />

        {/* Status bar & Controls */}
        <div className={`absolute bottom-4 left-4 flex items-center gap-3 p-1.5 rounded-xl border backdrop-blur-sm shadow-sm ${isDark ? 'bg-black/40 border-white/10' : 'bg-white/80 border-slate-200/50'}`}>

          <div className="flex items-center gap-2 pl-2 pr-1">
            <div className={`w-1.5 h-1.5 rounded-full ${workflow ? 'bg-emerald-400' : 'bg-slate-500'}`} />
            <span className={`text-[11px] font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {workflow ? `${workflow.nodes.length} ${t.status.nodes}` : t.status.no_workflow}
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
              title={t.actions.undo}
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
              title={t.actions.redo}
            >
              <RedoIcon size={14} />
            </button>
            <div className={`w-px h-3 mx-0.5 ${isDark ? 'bg-white/10' : 'bg-slate-200'}`} />
            <button
              onClick={handleClear}
              disabled={!workflow}
              className={`p-1.5 rounded-lg transition-colors ${workflow
                ? isDark ? 'hover:bg-rose-500/20 text-slate-400 hover:text-rose-400' : 'hover:bg-rose-50 text-slate-400 hover:text-rose-600'
                : isDark ? 'text-slate-700 cursor-not-allowed' : 'text-slate-300 cursor-not-allowed'
                }`}
              title={t.actions.discard}
            >
              <TrashIcon size={14} />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
