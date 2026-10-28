/**
 * Shape of a member profile as the profile page receives it, for building mock data.
 * Field names follow the company's profile/credit model so mocks and feature code
 * line up at integration. Dev and test only — feature code must not import from mocks/.
 */

import type { SuggestionField } from '../api/profile/suggest/_types.js';

export interface MockCredit {
  id: number;
  department: string;
  title: string;
  year: number | null;
  role: string | null;
  /** e.g. 'Film', 'TV', 'Short'; free text, as entered. */
  work_type: string | null;
  sort_order: number;
  entity_id: number | null;
}

export interface MockExperience {
  id: number;
  company: string;
  job_title: string;
  /** ISO date (YYYY-MM-DD). */
  start_date: string | null;
  end_date: string | null;
  description: string | null;
}

export interface MockAward {
  id: number;
  award_name: string;
  category: string | null;
  year: number | null;
  /** e.g. 'Won' | 'Nominated' */
  result: string;
  project: string | null;
}

export interface MockRepEntry {
  name: string;
  company: string;
  role: string;
  email?: string;
  phone?: string;
}

export interface MockMediaEntry {
  url: string;
  title: string;
  type: string;
}

export interface MockProfile {
  id: number;
  email: string;
  handle: string;
  display_name: string;
  headline: string | null;
  bio: string | null;
  location: string | null;
  avatar_url: string | null;
  skills: string[];
  representation: MockRepEntry[];
  media_links: MockMediaEntry[];
  featured_credit_ids: number[];
}

export interface MockProfileData {
  profile: MockProfile;
  credits: MockCredit[];
  experience: MockExperience[];
  awards: MockAward[];
}

/** A title page (film or TV) that credits can link to. */
export interface MockEntity {
  id: number;
  type: 'movie' | 'tvshow';
  title: string;
  slug: string;
  year: number | null;
  image_url: string | null;
}

/** Profile sections the auto-populate feature can suggest entries for. */
export type ProfileSection = SuggestionField;

export interface MockProfileFixture {
  key: 'empty' | 'populated';
  /** Which spec use case this stands in for. */
  useCase: string;
  data: MockProfileData;
  /**
   * Sections the member has edited by hand. The company model has no per-field
   * edit history, so this is a mock-only signal for the review screen's
   * "never overwrite silently" behavior.
   */
  manuallyEditedSections: ProfileSection[];
}
