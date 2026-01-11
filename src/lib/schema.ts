import { z } from 'zod';

// ============================================
// WorkflowSpec Schema - Source of Truth
// ============================================

export const LaneSchema = z.object({
  id: z.string(),
  name: z.string(),
  order: z.number(),
});

export const NodeMetadataSchema = z.object({
  isException: z.boolean().optional(),
  isEscalation: z.boolean().optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  estimatedDuration: z.string().optional(),
  assignee: z.string().optional(),
}).passthrough();

export const NodeSchema = z.object({
  id: z.string(),
  type: z.enum(['start', 'end', 'step', 'decision']),
  laneId: z.string(),
  title: z.string(),
  description: z.string().optional(),
  metadata: NodeMetadataSchema.optional(),
});

export const EdgeSchema = z.object({
  id: z.string(),
  from: z.string(),
  to: z.string(),
  type: z.enum(['normal', 'decision_yes', 'decision_no', 'loop', 'escalation']),
  label: z.string().optional(),
});

export const WorkflowMetadataSchema = z.object({
  domain: z.string().optional(),
  language: z.string().default('sv'),
  createdBy: z.string().optional(),
  createdAt: z.string().optional(),
  version: z.number().default(1),
});

export const WorkflowSpecSchema = z.object({
  lanes: z.array(LaneSchema),
  nodes: z.array(NodeSchema),
  edges: z.array(EdgeSchema),
  metadata: WorkflowMetadataSchema,
});

// ============================================
// TypeScript Types
// ============================================

export type Lane = z.infer<typeof LaneSchema>;
export type Node = z.infer<typeof NodeSchema>;
export type Edge = z.infer<typeof EdgeSchema>;
export type WorkflowMetadata = z.infer<typeof WorkflowMetadataSchema>;
export type WorkflowSpec = z.infer<typeof WorkflowSpecSchema>;

// ============================================
// Diff Summary for AI responses
// ============================================

export const DiffSummarySchema = z.object({
  added: z.array(z.string()),
  removed: z.array(z.string()),
  modified: z.array(z.string()),
  summary: z.string(),
});

export type DiffSummary = z.infer<typeof DiffSummarySchema>;

// ============================================
// AI Intel Schema (New)
// ============================================

export const AIWorkflowIntelSchema = z.object({
  decisionCount: z.number(),
  actionCount: z.number(),
});

export type AIWorkflowIntel = z.infer<typeof AIWorkflowIntelSchema>;

// ============================================
// AI Response Schema
// ============================================

export const AIWorkflowResponseSchema = z.object({
  workflowSpec: WorkflowSpecSchema,
  diffSummary: DiffSummarySchema,
  intel: AIWorkflowIntelSchema.optional(),
  warnings: z.array(z.string()).optional(),
  assumptions: z.array(z.string()).optional(),
});

export type AIWorkflowResponse = z.infer<typeof AIWorkflowResponseSchema>;

// ============================================
// Validation helpers
// ============================================

export function validateWorkflowSpec(data: unknown): WorkflowSpec {
  return WorkflowSpecSchema.parse(data);
}

export function safeValidateWorkflowSpec(data: unknown) {
  return WorkflowSpecSchema.safeParse(data);
}
