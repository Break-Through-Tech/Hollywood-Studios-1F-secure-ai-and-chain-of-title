import type { SuggestionField, SuggestionValueMap } from '../../api/profile/suggest/_types.ts';
import type { EvalCase } from './gold.ts';

export const FIELDS = ['bio', 'headline', 'location', 'experience', 'skills', 'credits', 'representation', 'awards'] as const satisfies readonly SuggestionField[];
export type Prediction = Partial<{ [F in SuggestionField]: SuggestionValueMap[F][] }>;
export type Predictions = Record<string, Prediction>;
export interface Counts { tp: number; fp: number; fn: number }

/** Conservative whole-entry equality: only case and whitespace are normalized.
 * Object keys are sorted; roles, dates, media, nulls and optional keys remain distinct.
 */
function canonical(value: unknown): string {
  if (typeof value === 'string') return JSON.stringify(value.trim().replace(/\s+/g, ' ').toLowerCase());
  if (Array.isArray(value)) return '[' + value.map(canonical).join(',') + ']';
  if (value !== null && typeof value === 'object') {
    return '{' + Object.entries(value).sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => JSON.stringify(k) + ':' + canonical(v)).join(',') + '}';
  }
  return JSON.stringify(value);
}

export function compareValues(expected: readonly unknown[], predicted: readonly unknown[]): Counts {
  const remaining = expected.map(canonical);
  let tp = 0;
  for (const value of predicted) {
    const index = remaining.indexOf(canonical(value));
    // Consume each label once: extra duplicate predictions are false positives.
    if (index >= 0) { tp++; remaining.splice(index, 1); }
  }
  return { tp, fp: predicted.length - tp, fn: remaining.length };
}

export function metrics(counts: Counts) {
  const { tp, fp, fn } = counts;
  // Undefined ratios use zero, including an entirely empty evaluation.
  const precision = tp + fp ? tp / (tp + fp) : 0;
  const recall = tp + fn ? tp / (tp + fn) : 0;
  return { ...counts, precision, recall, f1: 2 * tp + fp + fn ? 2 * tp / (2 * tp + fp + fn) : 0,
    falsePositiveShare: tp + fp ? fp / (tp + fp) : 0 };
}

export function evaluate(cases: EvalCase[], predictions: Predictions) {
  const known = new Set(cases.map(c => c.gold.id));
  for (const id of Object.keys(predictions)) if (!known.has(id)) throw new Error('Unknown case ID: ' + id);
  const totals = Object.fromEntries(FIELDS.map(f => [f, { tp: 0, fp: 0, fn: 0 }])) as Record<SuggestionField, Counts>;
  const included = cases.filter(c => Object.hasOwn(predictions, c.gold.id));
  const perCase = included.map(({ gold }) => {
    const fields = Object.fromEntries(FIELDS.map(field => {
      const counts = compareValues(gold.expected[field].map(item => item.value), predictions[gold.id][field] ?? []);
      totals[field].tp += counts.tp; totals[field].fp += counts.fp; totals[field].fn += counts.fn;
      return [field, metrics(counts)];
    }));
    return { id: gold.id, fields };
  });
  const overall = Object.values(totals).reduce((a, b) => ({ tp: a.tp + b.tp, fp: a.fp + b.fp, fn: a.fn + b.fn }), { tp: 0, fp: 0, fn: 0 });
  return {
    coverage: { evaluated: included.length, total: cases.length, fraction: cases.length ? included.length / cases.length : 0,
      skipped: cases.filter(c => !Object.hasOwn(predictions, c.gold.id)).map(c => c.gold.id) },
    overall: metrics(overall),
    perField: Object.fromEntries(FIELDS.map(f => [f, metrics(totals[f])])),
    perCase,
    unsupportedSourceClaims: { status: 'not assessed', count: null },
  };
}

/** Reject malformed containers and unknown fields instead of silently dropping predictions. */
export function parsePredictions(input: unknown): Predictions {
  const object = (v: unknown): v is Record<string, unknown> => v !== null && typeof v === 'object' && !Array.isArray(v);
  if (!object(input)) throw new Error('Predictions must be an object keyed by case ID');
  for (const [id, fields] of Object.entries(input)) {
    if (!object(fields)) throw new Error('Expected field object for ' + id);
    for (const [field, values] of Object.entries(fields)) {
      if (!(FIELDS as readonly string[]).includes(field) || !Array.isArray(values)) throw new Error('Invalid field/array: ' + id + '.' + field);
      for (const value of values) {
        if (['bio', 'headline', 'location', 'skills'].includes(field) ? typeof value !== 'string' : !object(value)) {
          throw new Error('Invalid value: ' + id + '.' + field);
        }
      }
    }
  }
  return input as Predictions;
}
