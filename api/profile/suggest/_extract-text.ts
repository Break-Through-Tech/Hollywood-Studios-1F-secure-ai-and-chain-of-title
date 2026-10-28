import type { VercelRequest, VercelResponse } from '@vercel/node';
import mammoth from 'mammoth';
import { PDFParse } from 'pdf-parse';
import { cleanExtractedText, MAX_EXTRACTED_CHARS } from './_clean-text.js';
import { INPUT_LIMITS, RESUME_FILE_TYPES } from './_types.js';
import type { ExtractTextResponse, ResumeKind } from './_types.js';

function kindFromName(fileName: string): ResumeKind | null {
  const lower = fileName.toLowerCase();
  for (const [kind, { extension }] of Object.entries(RESUME_FILE_TYPES)) {
    if (lower.endsWith(extension)) return kind as ResumeKind;
  }
  return null;
}

/** What the bytes actually are, regardless of the file name. */
function kindFromBytes(bytes: Buffer): ResumeKind | null {
  if (bytes.subarray(0, 5).toString('latin1') === '%PDF-') return 'pdf';
  // A .docx is a zip archive; its local file header starts with "PK\x03\x04".
  if (bytes.length >= 4 && bytes[0] === 0x50 && bytes[1] === 0x4b && bytes[2] === 0x03 && bytes[3] === 0x04) return 'docx';
  return null;
}

/** Accepts a data URL ("data:...;base64,....") or bare base64. */
function decodeBase64(fileData: string): Buffer | null {
  const base64 = fileData.startsWith('data:') ? fileData.slice(fileData.indexOf(',') + 1) : fileData;
  if (!/^[A-Za-z0-9+/\s]*={0,2}\s*$/.test(base64)) return null;
  return Buffer.from(base64, 'base64');
}

async function readPdf(bytes: Buffer): Promise<string> {
  const parser = new PDFParse({ data: new Uint8Array(bytes) });
  try {
    return (await parser.getText()).text;
  } finally {
    await parser.destroy();
  }
}

async function readDocx(bytes: Buffer): Promise<string> {
  return (await mammoth.extractRawText({ buffer: bytes })).value;
}

const fail = (res: VercelResponse, status: number, error: string, message: string) =>
  res.status(status).json({ error, message });

/**
 * POST { fileName, fileData } → the résumé's text, cleaned.
 * fileData is the file as base64 (a data URL is fine).
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return fail(res, 405, 'method_not_allowed', 'Use POST.');

  const { fileName, fileData } = (req.body && typeof req.body === 'object' ? req.body : {}) as Record<string, unknown>;
  if (typeof fileName !== 'string' || !fileName.trim() || typeof fileData !== 'string' || !fileData) {
    return fail(res, 400, 'missing_file', 'fileName and fileData are required.');
  }

  const kind = kindFromName(fileName);
  if (!kind) return fail(res, 415, 'unsupported_type', 'Upload a PDF or Word (.docx) file.');

  // Reject oversized uploads before decoding: base64 is ~4/3 the size of the bytes.
  if (fileData.length > Math.ceil(INPUT_LIMITS.resumeBytes * 4 / 3) + 256) {
    return fail(res, 413, 'too_large', `Files must be ${INPUT_LIMITS.resumeBytes / 1024 / 1024} MB or smaller.`);
  }
  const bytes = decodeBase64(fileData);
  if (!bytes) return fail(res, 400, 'bad_encoding', 'fileData must be base64.');
  if (bytes.length === 0) return fail(res, 400, 'empty_file', 'That file is empty.');
  if (bytes.length > INPUT_LIMITS.resumeBytes) {
    return fail(res, 413, 'too_large', `Files must be ${INPUT_LIMITS.resumeBytes / 1024 / 1024} MB or smaller.`);
  }
  if (kindFromBytes(bytes) !== kind) {
    return fail(res, 415, 'type_mismatch', `That file isn't a valid ${kind === 'pdf' ? 'PDF' : 'Word (.docx)'} document.`);
  }

  let raw: string;
  try {
    raw = kind === 'pdf' ? await readPdf(bytes) : await readDocx(bytes);
  } catch {
    return fail(res, 422, 'unreadable', "We couldn't read that file. It may be damaged or password-protected.");
  }

  const cleaned = cleanExtractedText(raw);
  if (!cleaned) {
    return fail(res, 422, 'no_text', "We couldn't find any text in that file. If it's a scanned document, paste the text instead.");
  }

  const truncated = cleaned.length > MAX_EXTRACTED_CHARS;
  const text = truncated ? cleaned.slice(0, MAX_EXTRACTED_CHARS) : cleaned;
  const body: ExtractTextResponse = { fileName, kind, text, charCount: text.length, truncated };
  return res.status(200).json(body);
}
