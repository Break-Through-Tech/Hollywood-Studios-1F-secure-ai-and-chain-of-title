import { expect, it } from 'vitest';
import { compareValues, evaluate, parsePredictions } from '../../scripts/eval/metrics.ts';
import { loadEvalCases } from '../../scripts/eval/gold.ts';

it('matches perfect predictions', () => expect(compareValues(['A'], [' a '])).toEqual({ tp: 1, fp: 0, fn: 0 }));
it('counts missing and incorrect values', () => expect(compareValues(['A', 'B'], ['C'])).toEqual({ tp: 0, fp: 1, fn: 2 }));
it('consumes duplicates once', () => expect(compareValues(['A'], ['A', 'A'])).toEqual({ tp: 1, fp: 1, fn: 0 }));
it('handles repeated labels', () => expect(compareValues(['A', 'A'], ['A'])).toEqual({ tp: 1, fp: 0, fn: 1 }));
it('handles empty predictions', () => expect(compareValues(['A'], [])).toEqual({ tp: 0, fp: 0, fn: 1 }));
it('preserves role, year and media distinctions', () => {
  const credit = { role: 'Producer', year: 2020, work_type: 'Film' };
  for (const change of [{ role: 'Executive Producer' }, { year: 2021 }, { work_type: 'TV' }])
    expect(compareValues([credit], [{ ...credit, ...change }])).toEqual({ tp: 0, fp: 1, fn: 1 });
});
it('reports partial coverage and missing fields', () => {
  const cases = loadEvalCases();
  const result = evaluate(cases, { [cases[0].gold.id]: {} });
  expect(result.coverage.evaluated).toBe(1);
  expect(result.coverage.total).toBe(30);
  expect(result.overall.fn).toBe(Object.values(cases[0].gold.expected).flat().length);
  expect(result.overall.f1).toBe(0);
  expect(evaluate(cases, {}).coverage.evaluated).toBe(0);
});
it('evaluates all gold-derived fixtures perfectly (not model performance)', () => {
  const cases = loadEvalCases();
  const fixtures = Object.fromEntries(cases.map(({ gold }) => [gold.id, Object.fromEntries(Object.entries(gold.expected).map(([field, items]) => [field, items.map(i => i.value)]))]));
  expect(evaluate(cases, parsePredictions(fixtures)).overall.f1).toBe(1);
});
it('rejects unknown IDs and malformed containers', () => {
  expect(() => evaluate(loadEvalCases(), { unknown: {} })).toThrow();
  for (const input of [[], null, { a: { skills: 'x' } }, { a: { typo: [] } }]) expect(() => parsePredictions(input)).toThrow();
});
