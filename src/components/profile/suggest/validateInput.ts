import { INPUT_LIMITS, RESUME_FILE_TYPES } from './types';
import type { ResumeKind } from './types';

export function resumeKindOf(fileName: string): ResumeKind | null {
  const lower = fileName.toLowerCase();
  for (const [kind, { extension }] of Object.entries(RESUME_FILE_TYPES)) {
    if (lower.endsWith(extension)) return kind as ResumeKind;
  }
  return null;
}

/** Client-side check before upload. The API re-checks the file's contents. */
export function resumeFileError(file: { name: string; size: number }): string | null {
  if (!resumeKindOf(file.name)) return 'Upload a PDF or Word (.docx) file.';
  if (file.size === 0) return 'That file is empty.';
  if (file.size > INPUT_LIMITS.resumeBytes) {
    return `That file is ${(file.size / 1024 / 1024).toFixed(1)} MB. The limit is ${INPUT_LIMITS.resumeBytes / 1024 / 1024} MB.`;
  }
  return null;
}

const REFERENCE_HOSTS = {
  linkedin: { hosts: ['linkedin.com'], label: 'LinkedIn', example: 'https://www.linkedin.com/in/your-name' },
  imdb: { hosts: ['imdb.com'], label: 'IMDb', example: 'https://www.imdb.com/name/nm0000000/' },
} as const;

export type ReferenceKind = keyof typeof REFERENCE_HOSTS;

/** Accepts an http(s) link on the expected site (any subdomain). Empty is fine: links are optional. */
export function referenceUrlError(kind: ReferenceKind, value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const { hosts, label, example } = REFERENCE_HOSTS[kind];
  let url: URL;
  try {
    url = new URL(/^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`);
  } catch {
    return `Enter a ${label} link, like ${example}`;
  }
  const host = url.hostname.toLowerCase();
  const onSite = hosts.some(h => host === h || host.endsWith(`.${h}`));
  if (!/^https?:$/.test(url.protocol) || !onSite) return `Enter a ${label} link, like ${example}`;
  return null;
}

/** Normalizes a valid reference link to https, or null when empty. */
export function normalizeReferenceUrl(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  return /^https?:\/\//i.test(trimmed) ? trimmed.replace(/^http:/i, 'https:') : `https://${trimmed}`;
}
