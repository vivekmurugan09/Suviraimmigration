import { describe, it, expect } from 'vitest';
import { preparationInput, preparationOutput } from '../lib/visa-preparation';
describe('consultation preparation boundaries', () => {
  it('requires a destination, background and visa goals', () => {
    expect(preparationInput.safeParse({ destination: 'Canada', background: '', goals: '' }).success).toBe(false);
    expect(preparationInput.parse({ destination: 'Canada', background: 'Indian engineer with five years of experience', goals: 'Skilled permanent residency' }).destination).toBe('Canada');
  });
  it('rejects unchecked definitive document claims', () => {
    expect(preparationOutput.safeParse({ summary: 'Example', documents: [{ name: 'Passport', reason: 'Identity', category: 'Identity', applicability: 'Guaranteed required' }], questions: ['Which programme?'], uncertainties: ['Nationality not known'] }).success).toBe(false);
  });
});