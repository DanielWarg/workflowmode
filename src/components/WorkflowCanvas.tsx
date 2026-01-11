'use client';

import { useCallback, useMemo, useEffect, useState } from 'react';
import {
    ReactFlow,
    Background,
    Controls,
    MiniMap,
    Node,
    Edge,
    NodeTypes,
    BackgroundVariant,
    useNodesState,
    useEdgesState,
    type ReactFlowInstance,
    getNodesBounds,
    getViewportForBounds,
} from '@xyflow/react';
import { toPng } from 'html-to-image';
import '@xyflow/react/dist/style.css';
import { useLanguage } from '@/components/LanguageProvider';

import type { WorkflowSpec, Node as WFNode, Lane } from '@/lib/schema';
import { StartNode, EndNode, StepNode, DecisionNode } from './nodes';
import { WorkflowIcon, DownloadIcon } from './icons';

// ============================================
// Constants
// ============================================

const LANE_WIDTH = 280;
const NODE_Y_SPACING = 140;
const NODE_X_OFFSET = 80;

// ============================================
// Transform WorkflowSpec to React Flow
// ============================================

function calculateNodePosition(
    node: WFNode,
    lanes: Lane[],
    nodeIndex: number
): { x: number; y: number } {
    const lane = lanes.find((l) => l.id === node.laneId);
    const laneOrder = lane?.order ?? 0;

    return {
        x: laneOrder * LANE_WIDTH + NODE_X_OFFSET,
        y: (nodeIndex + 1) * NODE_Y_SPACING,
    };
}

function transformToReactFlow(spec: WorkflowSpec, isDark: boolean): { nodes: Node[]; edges: Edge[] } {
    const nodes: Node[] = spec.nodes.map((node, index) => ({
        id: node.id,
        type: node.type,
        position: calculateNodePosition(node, spec.lanes, index),
        data: {
            label: node.title,
            description: node.description,
            laneId: node.laneId,
            metadata: node.metadata,
            isDark,
        },
    }));

    const edges: Edge[] = spec.edges.map((edge) => ({
        id: edge.id,
        source: edge.from,
        target: edge.to,
        label: edge.label,
        type: 'smoothstep',
        animated: edge.type === 'escalation',
        style: {
            stroke: edge.type === 'escalation' ? '#f43f5e' :
                edge.type === 'decision_yes' ? '#10b981' :
                    edge.type === 'decision_no' ? '#f43f5e' : isDark ? '#475569' : '#94a3b8',
            strokeWidth: 2,
        },
        labelStyle: {
            fill: isDark ? '#94a3b8' : '#475569',
            fontWeight: 500,
            fontSize: 11,
        },
        labelBgStyle: {
            fill: isDark ? '#1e293b' : '#ffffff',
            fillOpacity: 0.95,
        },
        labelBgPadding: [6, 4] as [number, number],
        labelBgBorderRadius: 6,
    }));

    return { nodes, edges };
}

function createFitBoundsNodes(lanes: Lane[], nodeCount: number): Node[] {
    const maxOrder = lanes.reduce((acc, lane) => Math.max(acc, lane.order), 0);
    const totalWidth = Math.max(LANE_WIDTH, (maxOrder + 1) * LANE_WIDTH);
    const totalHeight = Math.max(700, (nodeCount + 2) * NODE_Y_SPACING);

    const base: Omit<Node, 'id' | 'position'> = {
        type: 'default',
        data: {},
        draggable: false,
        selectable: false,
        connectable: false,
        deletable: false,
        focusable: false,
        style: {
            width: 1,
            height: 1,
            opacity: 0,
            border: 'none',
            background: 'transparent',
        },
    };

    return [
        { id: '__fit-tl', position: { x: 0, y: 0 }, ...base },
        { id: '__fit-tr', position: { x: totalWidth, y: 0 }, ...base },
        { id: '__fit-bl', position: { x: 0, y: totalHeight }, ...base },
        { id: '__fit-br', position: { x: totalWidth, y: totalHeight }, ...base },
    ];
}

// ============================================
// Lane Background
// ============================================

interface LaneBackgroundProps {
    lanes: Lane[];
    height: number;
    isDark: boolean;
}

function LaneBackground({ lanes, height, isDark }: LaneBackgroundProps) {
    const sortedLanes = [...lanes].sort((a, b) => a.order - b.order);

    return (
        <div className="absolute inset-0 pointer-events-none flex">
            {sortedLanes.map((lane, index) => (
                <div
                    key={lane.id}
                    className={`flex flex-col ${isDark ? 'border-r border-white/[0.04]' : 'border-r border-slate-200/60'}`}
                    style={{ width: LANE_WIDTH, minHeight: height }}
                >
                    <div className={`sticky top-0 z-10 px-4 py-3 ${isDark ? 'bg-[#0a0f1a]/95 backdrop-blur-sm border-b border-white/[0.04]' : 'bg-slate-50/95 backdrop-blur-sm border-b border-slate-200/60'}`}>
                        <span className={`text-[11px] font-semibold uppercase tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                            {lane.name}
                        </span>
                    </div>
                    <div
                        className={`flex-1 ${index % 2 === 0
                            ? isDark ? 'bg-white/[0.01]' : 'bg-slate-50/30'
                            : isDark ? 'bg-transparent' : 'bg-white/50'
                            }`}
                    />
                </div>
            ))}
        </div>
    );
}

// ============================================
// WorkflowCanvas Component
// ============================================

interface WorkflowCanvasProps {
    spec: WorkflowSpec | null;
    previewSpec?: WorkflowSpec | null;
    focusedNodeId?: string | null;
    onNodeClick?: (nodeId: string) => void;
    onNodesDelete?: (deletedNodes: Node[]) => void;
    theme?: 'dark' | 'light';
    fitViewTrigger?: number;
}

const nodeTypes: NodeTypes = {
    start: StartNode,
    end: EndNode,
    step: StepNode,
    decision: DecisionNode,
};

export function WorkflowCanvas({ spec, previewSpec, focusedNodeId, onNodeClick, onNodesDelete, theme = 'dark', fitViewTrigger }: WorkflowCanvasProps) {
    const isDark = theme === 'dark';
    const activeSpec = previewSpec ?? spec;
    const { t } = useLanguage();
    const [rfInstance, setRfInstance] = useState<ReactFlowInstance | null>(null);

    const { nodes: transformedNodes, edges: transformedEdges } = useMemo(() => {
        if (!activeSpec) return { nodes: [], edges: [] };
        const base = transformToReactFlow(activeSpec, isDark);
        const fitNodes = createFitBoundsNodes(activeSpec.lanes, activeSpec.nodes.length);
        return { nodes: [...base.nodes, ...fitNodes], edges: base.edges };
    }, [activeSpec, isDark]);

    const [nodes, setNodes, onNodesChange] = useNodesState(transformedNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(transformedEdges);

    // Sync nodes and edges when spec changes
    useEffect(() => {
        const nextNodes = (focusedNodeId
            ? transformedNodes.map((n) => ({ ...n, selected: n.id === focusedNodeId }))
            : transformedNodes);

        setNodes(nextNodes);
        setEdges(transformedEdges);
    }, [transformedNodes, transformedEdges, setNodes, setEdges, focusedNodeId]);

    // Handle camera focus trigger
    useEffect(() => {
        if (!fitViewTrigger) return;
        if (!rfInstance) return;
        if (transformedNodes.length === 0) return;

        // Ensure nodes are rendered before fitting view
        requestAnimationFrame(() => {
            rfInstance.fitView({ nodes: transformedNodes, padding: 0.28, duration: 800 });
        });
    }, [fitViewTrigger, rfInstance, transformedNodes]);

    // Focus/highlight a specific node (list ↔ canvas)
    useEffect(() => {
        if (!focusedNodeId) return;
        if (!rfInstance) return;

        const nodeToFocus = transformedNodes.find((n) => n.id === focusedNodeId);
        if (!nodeToFocus) return;

        rfInstance.fitView({ nodes: [nodeToFocus], padding: 0.35, duration: 700 });
    }, [focusedNodeId, rfInstance, transformedNodes]);

    const handleNodeClick = useCallback(
        (_: React.MouseEvent, node: Node) => {
            onNodeClick?.(node.id);
        },
        [onNodeClick]
    );

    const downloadImage = useCallback(() => {
        if (rfInstance && activeSpec) {
            const nodesBounds = getNodesBounds(nodes);
            const width = nodesBounds.width;
            const height = nodesBounds.height;
            const transform = getViewportForBounds(
                nodesBounds,
                width,
                height,
                0.5,
                2,
                0.2
            );

            toPng(document.querySelector('.react-flow__viewport') as HTMLElement, {
                backgroundColor: isDark ? '#0a0f1a' : '#f8fafc',
                width: width * 2, // higher res
                height: height * 2,
                style: {
                    width: `${width}px`,
                    height: `${height}px`,
                    transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.zoom})`,
                },
            }).then((dataUrl) => {
                const a = document.createElement('a');
                a.setAttribute('download', 'workflow.png');
                a.setAttribute('href', dataUrl);
                a.click();
            });
        }
    }, [rfInstance, nodes, isDark, activeSpec]);

    // Empty state
    if (!activeSpec) {
        return (
            <div className={`h-full w-full flex items-center justify-center ${isDark ? 'bg-[#0a0f1a]' : 'bg-slate-50'}`}>
                <div className="text-center space-y-8 max-w-lg px-8 animate-in fade-in duration-700 slide-in-from-bottom-4">
                    <div className={`w-24 h-24 mx-auto rounded-[2rem] flex items-center justify-center ${isDark ? 'bg-white/[0.03] border border-white/[0.06] shadow-2xl shadow-black/50' : 'bg-white border border-slate-200 shadow-xl shadow-slate-200/50'}`}>
                        <WorkflowIcon className={isDark ? 'text-teal-500' : 'text-teal-600'} size={40} />
                    </div>
                    <div className="space-y-4">
                        <h3 className={`text-3xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            {t.landing.title}
                        </h3>
                        <p className={`text-lg font-medium leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            {t.landing.subtitle}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    const canvasHeight = Math.max(700, (activeSpec.nodes.length + 2) * NODE_Y_SPACING);

    return (
        <div className={`h-full w-full relative ${isDark ? 'bg-[#0a0f1a]' : 'bg-slate-50'}`}>
            <LaneBackground lanes={activeSpec.lanes} height={canvasHeight} isDark={isDark} />
            <ReactFlow
                onInit={setRfInstance}
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onNodeClick={handleNodeClick}
                onNodesDelete={onNodesDelete}
                nodeTypes={nodeTypes}
                fitView
                fitViewOptions={{ padding: 0.28 }}
                minZoom={0.05}
                maxZoom={4}
                proOptions={{ hideAttribution: true }}
                className="bg-transparent"
            >
                <Background
                    variant={BackgroundVariant.Dots}
                    gap={24}
                    size={1}
                    color={isDark ? '#1e293b' : '#e2e8f0'}
                />
                <Controls
                    showInteractive={false}
                    position="top-left"
                    style={{ top: 76 }}
                    className={`!rounded-xl !shadow-lg ${isDark
                        ? '!bg-[#0d1424] !border !border-white/[0.06] [&>button]:!bg-transparent [&>button]:!border-0 [&>button]:!border-b [&>button]:!border-white/[0.06] [&>button:last-child]:!border-0 [&>button]:!text-slate-400 [&>button:hover]:!bg-white/[0.04] [&>button:hover]:!text-slate-300'
                        : '!bg-white !border !border-slate-200 [&>button]:!bg-transparent [&>button]:!border-0 [&>button]:!border-b [&>button]:!border-slate-100 [&>button:last-child]:!border-0 [&>button]:!text-slate-500 [&>button:hover]:!bg-slate-50 [&>button:hover]:!text-slate-700'
                        }`}
                />
                <MiniMap
                    className={`!rounded-xl !shadow-lg ${isDark ? '!bg-[#0d1424] !border !border-white/[0.06]' : '!bg-white !border !border-slate-200'}`}
                    nodeColor="#14b8a6"
                    maskColor={isDark ? 'rgba(10, 15, 26, 0.85)' : 'rgba(248, 250, 252, 0.85)'}
                    pannable
                    zoomable
                />
            </ReactFlow>

            {/* Preview indicator */}
            {previewSpec && (
                <div className="absolute top-5 left-1/2 -translate-x-1/2 z-20">
                    <div className={`flex items-center gap-2.5 px-4 py-2 rounded-full shadow-lg ${isDark ? 'bg-amber-500/10 border border-amber-400/20 backdrop-blur-sm' : 'bg-amber-50 border border-amber-200'}`}>
                        <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                        <span className={`text-[12px] font-medium ${isDark ? 'text-amber-300' : 'text-amber-700'}`}>
                            {t.actions.preview}
                        </span>
                    </div>
                </div>
            )}


            {/* Export Button */}
            {activeSpec && (
                <div className="absolute top-5 right-5 z-20">
                    <button
                        onClick={downloadImage}
                        className={`p-2.5 rounded-xl border shadow-lg transition-all ${isDark
                            ? 'bg-[#0d1424] border-white/[0.06] text-slate-400 hover:text-slate-300 hover:bg-white/[0.04]'
                            : 'bg-white border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                            }`}
                        title={t.actions.export}
                    >
                        <DownloadIcon size={18} />
                    </button>
                </div>
            )}
        </div>
    );
}
