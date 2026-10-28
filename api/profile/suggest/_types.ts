/**
 * Shared suggestion schema for profile auto-populate.
 *
 * Extraction (Profile team) produces Suggestions, matching (Matching team) fills in
 * matchedRecordId / matchConfidence, and the review screen (Profile team) sets status.
 * Value shapes use the same field names as the profile model so accepted values can be
 * handed to the existing save logic without renaming. Change only by team agreement.
 */

/** Profile sections the feature can suggest entries for (spec section 2). */
export type SuggestionField =
  | 'bio'
  | 'headline'
  | 'location'
  | 'experience'
  | 'skills'
  | 'credits'
  | 'representation'
  | 'awards';

/** Sections that hold one value; the rest hold a list, with one suggestion per item. */
export const SINGLE_VALUE_FIELDS = ['bio', 'headline', 'location'] as const satisfies readonly SuggestionField[];

export type SuggestionStatus = 'pending' | 'accepted' | 'edited' | 'rejected';

/** Which member input a suggestion was extracted from. */
export type SuggestionSource = 'bio' | 'creditList' | 'resume';

/** Department values used for grouping credits on the profile. Anything else is allowed but shows last. */
export const CREDIT_DEPARTMENTS = ['Acting', 'Directing', 'Producing', 'Writing', 'Music', 'Camera', 'Editing', 'Other'] as const;

/** Work type values offered when editing a credit. */
export const CREDIT_WORK_TYPES = ['Film', 'TV', 'Music Video', 'Short', 'Web Series'] as const;

/**
 * Year, year-month, or full date: 'YYYY' | 'YYYY-MM' | 'YYYY-MM-DD'.
 * Kept at the precision the source gave; never padded to a full date.
 */
export type PartialDate = string;

export interface CreditValue {
  /** Usually one of CREDIT_DEPARTMENTS. */
  department: string;
  title: string;
  year: number | null;
  /**
   * The member's exact role as written, e.g. 'Producer' vs 'Executive Producer',
   * or a character name for acting credits. Never collapsed to the department.
   */
  role: string | null;
  /** Usually one of CREDIT_WORK_TYPES; null when the source doesn't say. */
  work_type: string | null;
}

export interface ExperienceValue {
  company: string;
  job_title: string;
  start_date: PartialDate | null;
  /** null means current or not stated; check sourceSnippet to tell which. */
  end_date: PartialDate | null;
  description: string | null;
}

export interface AwardValue {
  award_name: string;
  category: string | null;
  year: number | null;
  /** 'Won' | 'Nominated' */
  result: 'Won' | 'Nominated';
  /** Title the award was for, when stated. */
  project: string | null;
}

export interface RepresentationValue {
  name: string;
  company: string;
  /** e.g. 'Agent', 'Manager', 'Publicist', 'Attorney' */
  role: string;
  email?: string;
  phone?: string;
}

/** The value type for each field. Single-value fields are strings; list fields are one item each. */
export interface SuggestionValueMap {
  bio: string;
  headline: string;
  location: string;
  experience: ExperienceValue;
  skills: string;
  credits: CreditValue;
  representation: RepresentationValue;
  awards: AwardValue;
}

interface SuggestionBase<F extends SuggestionField> {
  /** Stable within a review session; see suggestionKey() for de-duplication across runs. */
  id: string;
  field: F;
  /** What extraction proposed. Never modified after creation. */
  value: SuggestionValueMap[F];
  /** The member's edited version; set when status is 'edited'. */
  editedValue?: SuggestionValueMap[F];
  /** Exact, verbatim text from the member's input that supports this suggestion. */
  sourceSnippet: string;
  sourceInput?: SuggestionSource;
  /** True when extraction is unsure (ambiguous role, missing year, inferred type, ...). */
  needsConfirmation: boolean;
  /** Short reason shown to the member when needsConfirmation is true. */
  confirmationReason?: string;
  status: SuggestionStatus;
  /** Matching team: id of the existing record this maps to (title page for credits, company page for experience). */
  matchedRecordId?: number | null;
  /** Matching team: 0–1 confidence in matchedRecordId. */
  matchConfidence?: number;
}

/** One proposed profile entry. Narrow on `field` to get the matching value type. */
export type Suggestion = { [F in SuggestionField]: SuggestionBase<F> }[SuggestionField];

/** A suggestion for a specific field, e.g. SuggestionFor<'credits'>. */
export type SuggestionFor<F extends SuggestionField> = Extract<Suggestion, { field: F }>;

/** Limits shared by the input form and the API, so both reject the same things. */
export const INPUT_LIMITS = {
  bioChars: 10_000,
  creditListChars: 20_000,
  /** Kept under the 4.5 MB serverless request cap once base64-encoded (~4/3 growth). */
  resumeBytes: 3 * 1024 * 1024,
} as const;

/** Résumé formats accepted for upload. Legacy .doc is not supported. */
export const RESUME_FILE_TYPES = {
  pdf: { extension: '.pdf', mime: 'application/pdf' },
  docx: { extension: '.docx', mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
} as const;

export type ResumeKind = keyof typeof RESUME_FILE_TYPES;

/** Profile links the member supplies. Stored as references only; never fetched. */
export interface ProfileReferences {
  linkedin: string | null;
  imdb: string | null;
}

/** POST /api/profile/suggest/extract-text → 200 body. */
export interface ExtractTextResponse {
  fileName: string;
  kind: ResumeKind;
  text: string;
  charCount: number;
  /** True when the text was cut at the extraction length limit. */
  truncated: boolean;
}

/** Error body for every suggest endpoint: a stable code plus a message safe to show members. */
export interface SuggestErrorResponse {
  error: string;
  message: string;
}
