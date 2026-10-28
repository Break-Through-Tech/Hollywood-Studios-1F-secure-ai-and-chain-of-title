import { describe, expect, it } from 'vitest';
import { cleanExtractedText, MAX_EXTRACTED_CHARS } from '../../../../api/profile/suggest/_clean-text.js';
import handler from '../../../../api/profile/suggest/_router.js';
import { INPUT_LIMITS } from '../../../../api/profile/suggest/_types.js';
import { makeDocx, makePdf, toBase64, toDataUrl } from '../../../helpers/documents.js';
import { fakeRequest, fakeResponse } from '../../../helpers/vercel.js';

async function post(body: unknown, method = 'POST') {
  const { res, captured } = fakeResponse();
  await handler(fakeRequest({ url: '/api/profile/suggest/extract-text', method, body }), res);
  return captured as { status: number; body: Record<string, unknown> };
}

const DOCX_MIME = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

describe('extract-text: PDF', () => {
  it('returns cleaned text from every page', async () => {
    const pdf = makePdf([
      ['DEVIN OKONKWO-HALE', 'Producer | Executive Producer', 'Oversaw post-produc-', 'tion on six features.'],
      ['SELECTED CREDITS', 'Producer - Saltwater Saints (2015), feature'],
    ]);
    const { status, body } = await post({ fileName: 'Resume.PDF', fileData: toDataUrl(pdf, 'application/pdf') });
    expect(status).toBe(200);
    expect(body.kind).toBe('pdf');
    expect(body.truncated).toBe(false);
    const text = String(body.text);
    expect(text).toContain('Producer | Executive Producer');
    expect(text).toContain('post-production on six features.');
    expect(text).toContain('Producer - Saltwater Saints (2015), feature');
    expect(text).not.toMatch(/-- \d+ of \d+ --/);
    expect(body.charCount).toBe(text.length);
  });

  it('accepts bare base64 without a data URL prefix', async () => {
    const { status } = await post({ fileName: 'cv.pdf', fileData: toBase64(makePdf([['Editor']])) });
    expect(status).toBe(200);
  });

  it('422s on a PDF with no text (e.g. a scan)', async () => {
    const { status, body } = await post({ fileName: 'scan.pdf', fileData: toBase64(makePdf([[]])) });
    expect(status).toBe(422);
    expect(body.error).toBe('no_text');
  });

  it('422s on a damaged PDF', async () => {
    const junk = Buffer.concat([Buffer.from('%PDF-1.4\n'), Buffer.alloc(200, 0x41)]);
    const { status, body } = await post({ fileName: 'broken.pdf', fileData: toBase64(junk) });
    expect(status).toBe(422);
    expect(['unreadable', 'no_text']).toContain(body.error);
  });
});

describe('extract-text: DOCX', () => {
  it('returns paragraphs, keeping accents', async () => {
    const docx = makeDocx(['Valentina Ruiz-Ebrahimi', 'Producer — Les Éphémères (2020)', 'Executive Producer — La Casa del Faro (2021–2023)']);
    const { status, body } = await post({ fileName: 'bio.docx', fileData: toDataUrl(docx, DOCX_MIME) });
    expect(status).toBe(200);
    expect(body.kind).toBe('docx');
    expect(body.text).toContain('Producer — Les Éphémères (2020)');
    expect(body.text).toContain('La Casa del Faro (2021–2023)');
  });
});

describe('extract-text: validation', () => {
  it('405s on GET', async () => {
    expect((await post(undefined, 'GET')).status).toBe(405);
  });

  it('400s when the file is missing', async () => {
    expect((await post({ fileName: 'cv.pdf' })).status).toBe(400);
    expect((await post({})).status).toBe(400);
  });

  it('415s on unsupported extensions, including legacy .doc', async () => {
    for (const fileName of ['cv.doc', 'cv.txt', 'photo.png', 'cv']) {
      const { status, body } = await post({ fileName, fileData: toBase64(makePdf([['x']])) });
      expect(status, fileName).toBe(415);
      expect(body.error).toBe('unsupported_type');
    }
  });

  it('415s when contents do not match the extension', async () => {
    expect((await post({ fileName: 'cv.pdf', fileData: toBase64(makeDocx(['x'])) })).body.error).toBe('type_mismatch');
    expect((await post({ fileName: 'cv.docx', fileData: toBase64(makePdf([['x']])) })).body.error).toBe('type_mismatch');
    expect((await post({ fileName: 'cv.pdf', fileData: toBase64(Buffer.from('<html>hi</html>')) })).body.error).toBe('type_mismatch');
  });

  it('413s on files over the size limit', async () => {
    const big = Buffer.concat([Buffer.from('%PDF-1.4\n'), Buffer.alloc(INPUT_LIMITS.resumeBytes + 1)]);
    const { status, body } = await post({ fileName: 'big.pdf', fileData: toBase64(big) });
    expect(status).toBe(413);
    expect(body.error).toBe('too_large');
  });

  it('400s on empty files and non-base64 data', async () => {
    expect((await post({ fileName: 'cv.pdf', fileData: 'data:application/pdf;base64,' })).body.error).toBe('empty_file');
    expect((await post({ fileName: 'cv.pdf', fileData: 'not base64!' })).body.error).toBe('bad_encoding');
  });
});

describe('cleanExtractedText', () => {
  it('normalizes line endings, ligatures and invisible characters', () => {
    expect(cleanExtractedText('ﬁlm\r\nco­writer​ here')).toBe('film\ncowriter here');
  });

  it('rejoins words split across lines but keeps real hyphens', () => {
    expect(cleanExtractedText('develop-\nment slate')).toBe('development slate');
    expect(cleanExtractedText('Co-\nProducer')).toBe('Co-\nProducer');
    expect(cleanExtractedText('Okonkwo-Hale')).toBe('Okonkwo-Hale');
  });

  it('removes page markers, collapses blank runs, and keeps column gaps', () => {
    expect(cleanExtractedText('A\n\n\n\n-- 1 of 2 --\n\nB')).toBe('A\n\nB');
    expect(cleanExtractedText('2023      Thistledown   \t')).toBe('2023  Thistledown');
  });

  it('exposes the truncation limit', () => {
    expect(MAX_EXTRACTED_CHARS).toBeGreaterThan(INPUT_LIMITS.bioChars);
  });
});
