import { SINGLE_VALUE_FIELDS } from './_types.js';
import type { Suggestion, SuggestionField, SuggestionValueMap } from './_types.js';

/** The value to save: the member's edit if there is one, otherwise what was extracted. */
export function effectiveValue<F extends SuggestionField>(s: Extract<Suggestion, { field: F }>): SuggestionValueMap[F] {
  return (s.editedValue ?? s.value) as SuggestionValueMap[F];
}

export function isSingleValueField(field: SuggestionField): field is (typeof SINGLE_VALUE_FIELDS)[number] {
  return (SINGLE_VALUE_FIELDS as readonly string[]).includes(field);
}

/** Lowercase, strip accents and punctuation, collapse whitespace. */
export function normalizeText(value: string | null | undefined): string {
  return (value ?? '')
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function yearOf(date: string | null): string {
  return date?.slice(0, 4) ?? '';
}

/**
 * Identity of a suggestion across extraction runs: two suggestions with the same key
 * describe the same entry and must not both be shown. Single-value fields have one key
 * per field. Credits keep role in the key so Producer and Executive Producer stay
 * separate, and year so a remake isn't merged with the original.
 */
export function suggestionKey(s: Suggestion): string {
  if (isSingleValueField(s.field)) return s.field;
  const parts = ((): string[] => {
    switch (s.field) {
      case 'skills':
        return [s.value];
      case 'credits':
        return [s.value.title, String(s.value.year ?? ''), s.value.role ?? ''];
      case 'experience':
        return [s.value.company, s.value.job_title, yearOf(s.value.start_date)];
      case 'awards':
        return [s.value.award_name, s.value.category ?? '', String(s.value.year ?? ''), s.value.project ?? ''];
      case 'representation':
        return [s.value.name, s.value.company];
      default:
        return [];
    }
  })();
  return [s.field, ...parts.map(normalizeText)].join('|');
}
