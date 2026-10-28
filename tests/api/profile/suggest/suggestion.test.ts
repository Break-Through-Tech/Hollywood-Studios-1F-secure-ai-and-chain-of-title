import { describe, expect, expectTypeOf, it } from 'vitest';
import { effectiveValue, normalizeText, suggestionKey } from '../../../../api/profile/suggest/_suggestion.js';
import type { CreditValue, Suggestion, SuggestionFor, SuggestionValueMap } from '../../../../api/profile/suggest/_types.js';
import { mockProfiles } from '../../../../mocks/index.js';

function credit(value: Partial<CreditValue>, extra: Partial<SuggestionFor<'credits'>> = {}): SuggestionFor<'credits'> {
  return {
    id: 'c1',
    field: 'credits',
    value: { department: 'Producing', title: 'Harbor Lights', year: 2004, role: 'Producer', work_type: 'Film', ...value },
    sourceSnippet: 'Producer, Harbor Lights (2004)',
    needsConfirmation: false,
    status: 'pending',
    ...extra,
  };
}

describe('Suggestion type', () => {
  it('narrows value by field', () => {
    const check = (s: Suggestion) => {
      if (s.field === 'credits') expectTypeOf(s.value).toEqualTypeOf<CreditValue>();
      if (s.field === 'bio') expectTypeOf(s.value).toEqualTypeOf<string>();
    };
    check(credit({}));
  });

  it('rejects a value of the wrong shape for its field', () => {
    // @ts-expect-error a bio suggestion cannot carry a credit value
    const bad: Suggestion = { id: 'x', field: 'bio', value: credit({}).value, sourceSnippet: '', needsConfirmation: false, status: 'pending' };
    expect(bad).toBeDefined();
  });

  it('accepts existing profile credits as CreditValue without renaming fields', () => {
    const existing = mockProfiles.populated.data.credits[0];
    const asValue: CreditValue = existing;
    expect(asValue.title).toBe('Harbor Lights');
    expectTypeOf<SuggestionValueMap['credits']>().toEqualTypeOf<CreditValue>();
  });
});

describe('effectiveValue', () => {
  it('returns the extracted value until the member edits it', () => {
    expect(effectiveValue(credit({})).role).toBe('Producer');
  });

  it('prefers the edited value', () => {
    const edited = credit({}, { status: 'edited', editedValue: { ...credit({}).value, role: 'Executive Producer' } });
    expect(effectiveValue(edited).role).toBe('Executive Producer');
    expect(edited.value.role).toBe('Producer');
  });
});

describe('suggestionKey', () => {
  it('ignores case, accents, punctuation and spacing', () => {
    expect(normalizeText('  Café — Society! ')).toBe('cafe society');
    expect(suggestionKey(credit({ title: 'HARBOR  LIGHTS' }))).toBe(suggestionKey(credit({ title: 'Harbor Lights.' })));
  });

  it('keeps Producer and Executive Producer apart', () => {
    expect(suggestionKey(credit({ role: 'Producer' }))).not.toBe(suggestionKey(credit({ role: 'Executive Producer' })));
  });

  it('keeps a remake apart from the original', () => {
    expect(suggestionKey(credit({ year: 2004 }))).not.toBe(suggestionKey(credit({ year: 2022 })));
  });

  it('ignores ids, status and snippet so a re-run maps onto the same entry', () => {
    const a = credit({}, { id: 'run1', status: 'accepted' });
    const b = credit({}, { id: 'run2', sourceSnippet: 'Harbor Lights — Producer', needsConfirmation: true });
    expect(suggestionKey(a)).toBe(suggestionKey(b));
  });

  it('gives single-value fields one key per field', () => {
    const base = { id: 'b', sourceSnippet: '', needsConfirmation: false, status: 'pending' } as const;
    expect(suggestionKey({ ...base, field: 'bio', value: 'One bio.' })).toBe(suggestionKey({ ...base, field: 'bio', value: 'Another.' }));
  });

  it('separates experience by start year and awards by year', () => {
    const exp = (start: string) => suggestionKey({
      id: 'e', field: 'experience', sourceSnippet: '', needsConfirmation: false, status: 'pending',
      value: { company: 'Larkspur', job_title: 'Producer', start_date: start, end_date: null, description: null },
    });
    expect(exp('2015')).toBe(exp('2015-06'));
    expect(exp('2015')).not.toBe(exp('2019'));
  });
});
