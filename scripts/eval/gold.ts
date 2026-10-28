import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { SuggestionField, SuggestionSource, SuggestionValueMap } from '../../api/profile/suggest/_types.ts';

/** One expected entry. Mirrors a Suggestion minus the review-time fields. */
export interface GoldItem<V> {
  value: V;
  /** The extractor should flag this item for confirmation. */
  needsConfirmation?: boolean;
  /** Why the label is what it is; for human reviewers. */
  note?: string;
}

export type GoldExpected = { [F in SuggestionField]: GoldItem<SuggestionValueMap[F]>[] };

export interface GoldCase {
  id: string;
  summary: string;
  tags: string[];
  /** Input kind → file name inside the case folder. */
  inputs: Partial<Record<SuggestionSource, string>>;
  expected: GoldExpected;
  /** Things that must NOT be extracted, and other labeling notes. */
  notes: string[];
}

export interface EvalCase {
  gold: GoldCase;
  /** Input kind → file contents. */
  texts: Partial<Record<SuggestionSource, string>>;
}

export const EVAL_CASES_DIR = join(import.meta.dirname, '../../data/eval/cases');

export function loadEvalCases(dir = EVAL_CASES_DIR): EvalCase[] {
  return readdirSync(dir, { withFileTypes: true })
    .filter(d => d.isDirectory() && existsSync(join(dir, d.name, 'gold.json')))
    .map(d => d.name)
    .sort()
    .map(name => {
      const gold = JSON.parse(readFileSync(join(dir, name, 'gold.json'), 'utf8')) as GoldCase;
      const texts: EvalCase['texts'] = {};
      for (const [kind, file] of Object.entries(gold.inputs) as [SuggestionSource, string][]) {
        texts[kind] = readFileSync(join(dir, name, file), 'utf8');
      }
      return { gold, texts };
    });
}
