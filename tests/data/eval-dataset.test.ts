import { describe, expect, it } from 'vitest';
import { normalizeText } from '../../api/profile/suggest/_suggestion.js';
import { CREDIT_DEPARTMENTS, CREDIT_WORK_TYPES } from '../../api/profile/suggest/_types.js';
import type { SuggestionField } from '../../api/profile/suggest/_types.js';
import { loadEvalCases } from '../../scripts/eval/gold.js';

const cases = loadEvalCases();
const FIELDS: SuggestionField[] = ['bio', 'headline', 'location', 'experience', 'skills', 'credits', 'representation', 'awards'];
const DATE = /^\d{4}(-\d{2}(-\d{2})?)?$/;

describe('eval dataset', () => {
  it('has 30 cases with unique ids', () => {
    expect(cases).toHaveLength(30);
    expect(new Set(cases.map(c => c.gold.id)).size).toBe(30);
  });

  it('covers the required tricky cases', () => {
    const tags = new Set(cases.flatMap(c => c.gold.tags));
    for (const tag of ['producer-vs-ep', 'remake-same-title', 'missing-year', 'tv-vs-film']) expect(tags).toContain(tag);
  });

  it('uses every input kind', () => {
    const kinds = new Set(cases.flatMap(c => Object.keys(c.texts)));
    expect(kinds).toEqual(new Set(['bio', 'creditList', 'resume']));
  });
});

describe.each(cases.map(c => [c.gold.id, c] as const))('%s', (_id, { gold, texts }) => {
  const source = normalizeText(Object.values(texts).join('\n'));
  const grounded = (s: string | null | undefined) => {
    if (s) expect(source, `"${s}" not found in source`).toContain(normalizeText(s));
  };

  it('lists every field, with at most one value for single-value fields', () => {
    expect(Object.keys(gold.expected).sort()).toEqual([...FIELDS].sort());
    for (const f of ['bio', 'headline', 'location'] as const) expect(gold.expected[f].length).toBeLessThanOrEqual(1);
  });

  it('only labels text that appears in the input', () => {
    const e = gold.expected;
    for (const f of ['bio', 'headline', 'location', 'skills'] as const) e[f].forEach(i => grounded(i.value));
    e.credits.forEach(({ value: v }) => { grounded(v.title); if (v.year) grounded(String(v.year)); });
    e.experience.forEach(({ value: v }) => { grounded(v.company); grounded(v.description); });
    e.awards.forEach(({ value: v }) => { grounded(v.award_name); grounded(v.category); grounded(v.project); if (v.year) grounded(String(v.year)); });
    e.representation.forEach(({ value: v }) => { grounded(v.name); grounded(v.company); grounded(v.email); });
  });

  it('uses valid option values and date formats', () => {
    for (const { value: v } of gold.expected.credits) {
      expect(CREDIT_DEPARTMENTS).toContain(v.department);
      if (v.work_type !== null) expect(CREDIT_WORK_TYPES).toContain(v.work_type);
    }
    for (const { value: v } of gold.expected.experience) {
      for (const d of [v.start_date, v.end_date]) if (d !== null) expect(d).toMatch(DATE);
    }
    for (const { value: v } of gold.expected.awards) expect(['Won', 'Nominated']).toContain(v.result);
  });

  it('explains every item flagged for confirmation', () => {
    for (const f of FIELDS) for (const item of gold.expected[f]) if (item.needsConfirmation) expect(item.note).toBeTruthy();
  });

  it('has no duplicate credits', () => {
    const keys = gold.expected.credits.map(({ value: v }) => [v.title, v.year, v.role].map(x => normalizeText(String(x))).join('|'));
    expect(new Set(keys).size).toBe(keys.length);
  });
});
