'use client';

import { Handle, Position, NodeProps } from '@xyflow/react';

// ============================================
// Node Components — Premium Design
// ============================================

interface NodeData {
    label: string;
    description?: string;
    laneId: string;
    metadata?: Record<string, unknown>;
    isDark?: boolean;
}

// ============================================
// Start Node
// ============================================

export function StartNode({ data }: NodeProps) {
    const nodeData = data as NodeData;
    return (
        <div className="group relative">
            <div className="absolute inset-0 bg-emerald-500/20 rounded-2xl blur-xl transition-opacity opacity-0 group-hover:opacity-100" />
            <div className="relative px-5 py-3.5 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 border border-emerald-400/30 shadow-lg shadow-emerald-500/20 min-w-[160px] transition-all duration-200 hover:shadow-emerald-500/30 hover:scale-[1.02]">
                <div className="flex items-center gap-2.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-white/30 flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    </div>
                    <span className="text-[13px] font-semibold text-white tracking-tight">{nodeData.label}</span>
                </div>
                {nodeData.description && (
                    <p className="text-[11px] text-white/70 mt-2 leading-relaxed">{nodeData.description}</p>
                )}
                <Handle
                    type="source"
                    position={Position.Bottom}
                    className="!w-3 !h-3 !bg-emerald-300 !border-2 !border-emerald-600 !-bottom-1.5 hover:!scale-125 transition-transform"
                />
            </div>
        </div>
    );
}

// ============================================
// End Node
// ============================================

export function EndNode({ data }: NodeProps) {
    const nodeData = data as NodeData;
    return (
        <div className="group relative">
            <div className="absolute inset-0 bg-rose-500/20 rounded-2xl blur-xl transition-opacity opacity-0 group-hover:opacity-100" />
            <div className="relative px-5 py-3.5 rounded-2xl bg-gradient-to-br from-rose-500 to-rose-600 border border-rose-400/30 shadow-lg shadow-rose-500/20 min-w-[160px] transition-all duration-200 hover:shadow-rose-500/30 hover:scale-[1.02]">
                <Handle
                    type="target"
                    position={Position.Top}
                    className="!w-3 !h-3 !bg-rose-300 !border-2 !border-rose-600 !-top-1.5 hover:!scale-125 transition-transform"
                />
                <div className="flex items-center gap-2.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-white/30 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-white" />
                    </div>
                    <span className="text-[13px] font-semibold text-white tracking-tight">{nodeData.label}</span>
                </div>
                {nodeData.description && (
                    <p className="text-[11px] text-white/70 mt-2 leading-relaxed">{nodeData.description}</p>
                )}
            </div>
        </div>
    );
}

// ============================================
// Step Node
// ============================================

export function StepNode({ data }: NodeProps) {
    const nodeData = data as NodeData;
    const isEscalation = nodeData.metadata?.isEscalation;
    const isException = nodeData.metadata?.isException;

    const colorClasses = isEscalation
        ? 'from-orange-500 to-amber-500 border-orange-400/30 shadow-orange-500/20 hover:shadow-orange-500/30'
        : isException
            ? 'from-red-500 to-rose-500 border-red-400/30 shadow-red-500/20 hover:shadow-red-500/30'
            : 'from-teal-500 to-cyan-500 border-teal-400/30 shadow-teal-500/20 hover:shadow-teal-500/30';

    const glowColor = isEscalation ? 'bg-orange-500/20' : isException ? 'bg-red-500/20' : 'bg-teal-500/20';

    return (
        <div className="group relative">
            <div className={`absolute inset-0 ${glowColor} rounded-2xl blur-xl transition-opacity opacity-0 group-hover:opacity-100`} />
            <div className={`relative px-5 py-3.5 rounded-2xl bg-gradient-to-br ${colorClasses} shadow-lg min-w-[180px] max-w-[240px] transition-all duration-200 hover:scale-[1.02]`}>
                <Handle
                    type="target"
                    position={Position.Top}
                    className="!w-3 !h-3 !bg-white/80 !border-2 !border-teal-600 !-top-1.5 hover:!scale-125 transition-transform"
                />
                <div className="flex items-center gap-2.5">
                    {(isEscalation || isException) && (
                        <svg className="w-4 h-4 text-white/80 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    )}
                    <span className="text-[13px] font-semibold text-white tracking-tight">{nodeData.label}</span>
                </div>
                {nodeData.description && (
                    <p className="text-[11px] text-white/70 mt-2 leading-relaxed line-clamp-2">{nodeData.description}</p>
                )}
                <Handle
                    type="source"
                    position={Position.Bottom}
                    className="!w-3 !h-3 !bg-white/80 !border-2 !border-teal-600 !-bottom-1.5 hover:!scale-125 transition-transform"
                />
            </div>
        </div>
    );
}

// ============================================
// Decision Node
// ============================================

export function DecisionNode({ data }: NodeProps) {
    const nodeData = data as NodeData;
    return (
        <div className="group relative">
            <div className="absolute inset-0 bg-amber-500/20 rounded-2xl blur-xl transition-opacity opacity-0 group-hover:opacity-100" />
            <div className="relative px-5 py-3.5 rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-500 border border-amber-400/30 shadow-lg shadow-amber-500/20 min-w-[160px] transition-all duration-200 hover:shadow-amber-500/30 hover:scale-[1.02]">
                <Handle
                    type="target"
                    position={Position.Top}
                    className="!w-3 !h-3 !bg-amber-200 !border-2 !border-amber-600 !-top-1.5 hover:!scale-125 transition-transform"
                />
                <div className="flex items-center gap-2.5">
                    <svg className="w-4 h-4 text-white/80 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-[13px] font-semibold text-white tracking-tight">{nodeData.label}</span>
                </div>
                <Handle
                    type="source"
                    position={Position.Bottom}
                    id="yes"
                    className="!w-3 !h-3 !bg-emerald-400 !border-2 !border-emerald-600 !-bottom-1.5 !left-[30%] hover:!scale-125 transition-transform"
                />
                <Handle
                    type="source"
                    position={Position.Bottom}
                    id="no"
                    className="!w-3 !h-3 !bg-rose-400 !border-2 !border-rose-600 !-bottom-1.5 !left-[70%] hover:!scale-125 transition-transform"
                />
            </div>
        </div>
    );
}
