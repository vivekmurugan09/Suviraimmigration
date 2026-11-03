import { z } from 'zod';

export const INFORMATIONAL_NOTICE = 'AI-generated information only—not legal advice or an official document list. Requirements change; confirm everything with the destination government and a qualified immigration adviser.';
export const preparationInput = z.object({
  destination: z.string().trim().min(2).max(100),
  background: z.string().trim().min(20).max(2500),
  goals: z.string().trim().min(10).max(1500),
});
export const preparationOutput = z.object({
  summary: z.string().min(1).max(2000),
  documents: z.array(z.object({ name: z.string().min(1).max(200), reason: z.string().min(1).max(600), category: z.enum(['Identity', 'Education', 'Work', 'Finances', 'Family', 'Other']), applicability: z.enum(['Commonly requested', 'May apply', 'Confirm with adviser']) })).min(1).max(20),
  questions: z.array(z.string().min(1).max(600)).min(1).max(12),
  uncertainties: z.array(z.string().min(1).max(600)).min(1).max(8),
});
export type PreparationInput = z.infer<typeof preparationInput>;
export type PreparationOutput = z.infer<typeof preparationOutput>;
export const outputJsonSchema = {
  type: 'object', additionalProperties: false,
  properties: {
    summary: { type: 'string' },
    documents: { type: 'array', items: { type: 'object', additionalProperties: false, properties: { name: { type: 'string' }, reason: { type: 'string' }, category: { type: 'string', enum: ['Identity', 'Education', 'Work', 'Finances', 'Family', 'Other'] }, applicability: { type: 'string', enum: ['Commonly requested', 'May apply', 'Confirm with adviser'] } }, required: ['name', 'reason', 'category', 'applicability'] } },
    questions: { type: 'array', items: { type: 'string' } },
    uncertainties: { type: 'array', items: { type: 'string' } },
  }, required: ['summary', 'documents', 'questions', 'uncertainties'],
};