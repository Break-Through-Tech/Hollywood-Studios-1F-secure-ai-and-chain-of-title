import type { ExtractTextResponse, SuggestErrorResponse } from './types';

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("We couldn't read that file."));
    reader.readAsDataURL(file);
  });
}

/** Sends a résumé to the API and returns its text. Throws an Error with a member-facing message. */
export async function extractResumeText(file: File): Promise<ExtractTextResponse> {
  const res = await fetch('/api/profile/suggest/extract-text', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fileName: file.name, fileData: await readAsDataUrl(file) }),
  });
  const body = await res.json().catch(() => null) as ExtractTextResponse | SuggestErrorResponse | null;
  if (!res.ok || !body || 'error' in body) {
    throw new Error(body && 'message' in body ? body.message : `Upload failed (${res.status}).`);
  }
  return body;
}
