import { useEffect, useId, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { INPUT_LIMITS, RESUME_FILE_TYPES } from './types';
import type { ProfileReferences } from './types';
import { normalizeReferenceUrl, referenceUrlError, resumeFileError } from './validateInput';

/** Everything the member supplied, ready for text extraction and suggestion. */
export interface PopulateSubmission {
  bioText: string;
  creditListText: string;
  resumeFile: File | null;
  references: ProfileReferences;
  /** Always true: the form can't be submitted without it. */
  permissionConfirmed: true;
}

interface PopulateProfileProps {
  /** Resolve to close the dialog; reject (with a message) to keep it open and show the error. */
  onSubmit: (submission: PopulateSubmission) => Promise<void>;
  /** Profile photo upload control, supplied by the photo feature. Hidden when absent. */
  photoSlot?: ReactNode;
}

/** "Populate My Profile" button plus the dialog that collects the member's materials. */
export function PopulateProfile({ onSubmit, photoSlot }: PopulateProfileProps) {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const close = () => {
    setOpen(false);
    buttonRef.current?.focus();
  };

  return (
    <>
      <button ref={buttonRef} type="button" className="pp-trigger" onClick={() => setOpen(true)}>
        Populate My Profile
      </button>
      {open && (
        <PopulateProfileDialog
          photoSlot={photoSlot}
          onCancel={close}
          onSubmit={async submission => {
            await onSubmit(submission);
            close();
          }}
        />
      )}
    </>
  );
}

interface DialogProps {
  onSubmit: (submission: PopulateSubmission) => Promise<void>;
  onCancel: () => void;
  photoSlot?: ReactNode;
}

const ACCEPT = Object.values(RESUME_FILE_TYPES).flatMap(t => [t.extension, t.mime]).join(',');

export function PopulateProfileDialog({ onSubmit, onCancel, photoSlot }: DialogProps) {
  const id = useId();
  const firstFieldRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [bioText, setBioText] = useState('');
  const [creditListText, setCreditListText] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [linkedin, setLinkedin] = useState('');
  const [imdb, setImdb] = useState('');
  const [permission, setPermission] = useState(false);
  const [triedSubmit, setTriedSubmit] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => { firstFieldRef.current?.focus(); }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && !submitting) onCancel(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onCancel, submitting]);

  const linkedinError = referenceUrlError('linkedin', linkedin);
  const imdbError = referenceUrlError('imdb', imdb);
  const hasMaterial = Boolean(bioText.trim() || creditListText.trim() || resumeFile);
  const canSubmit = hasMaterial && permission && !linkedinError && !imdbError && !submitting;

  const chooseFile = (file: File | undefined) => {
    if (!file) return;
    const error = resumeFileError(file);
    setFileError(error);
    setResumeFile(error ? null : file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTriedSubmit(true);
    if (!canSubmit) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      await onSubmit({
        bioText: bioText.trim(),
        creditListText: creditListText.trim(),
        resumeFile,
        references: { linkedin: normalizeReferenceUrl(linkedin), imdb: normalizeReferenceUrl(imdb) },
        permissionConfirmed: true,
      });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="pp-overlay" onClick={submitting ? undefined : onCancel} />
      <div className="pp-dialog" role="dialog" aria-modal="true" aria-labelledby={`${id}-title`}>
        <form className="pp-form" onSubmit={submit} noValidate>
          <header className="pp-head">
            <h2 id={`${id}-title`} className="pp-title">Populate My Profile</h2>
            <p className="pp-lede">
              Add any of the materials below. We'll suggest profile entries from them, and you'll review every
              suggestion before anything is saved.
            </p>
          </header>

          <div className="pp-body">
            <section className="pp-field">
              <label htmlFor={`${id}-bio`} className="pp-label">Professional biography</label>
              <p className="pp-hint">Paste your bio. It can mention just a few highlights.</p>
              <textarea
                ref={firstFieldRef}
                id={`${id}-bio`}
                className="pp-textarea"
                rows={6}
                maxLength={INPUT_LIMITS.bioChars}
                value={bioText}
                onChange={e => setBioText(e.target.value)}
              />
              <Counter value={bioText} max={INPUT_LIMITS.bioChars} />
            </section>

            <section className="pp-field">
              <label htmlFor={`${id}-credits`} className="pp-label">Full credit list</label>
              <p className="pp-hint">Paste your complete film and TV credits, one per line, in any format.</p>
              <textarea
                id={`${id}-credits`}
                className="pp-textarea pp-textarea--mono"
                rows={6}
                maxLength={INPUT_LIMITS.creditListChars}
                placeholder={'Harbor Lights (2004) – Producer\nNorthbound (TV, 2019) – Executive Producer'}
                value={creditListText}
                onChange={e => setCreditListText(e.target.value)}
              />
              <Counter value={creditListText} max={INPUT_LIMITS.creditListChars} />
            </section>

            <section className="pp-field">
              <span className="pp-label" id={`${id}-resume-label`}>Résumé or bio document</span>
              <p className="pp-hint">PDF or Word (.docx), up to {INPUT_LIMITS.resumeBytes / 1024 / 1024} MB.</p>
              {resumeFile ? (
                <div className="pp-file">
                  <span className="pp-file-name">{resumeFile.name}</span>
                  <button type="button" className="pp-link-btn" onClick={() => setResumeFile(null)}>Remove</button>
                </div>
              ) : (
                <label className="pp-upload">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={ACCEPT}
                    className="pp-visually-hidden"
                    aria-labelledby={`${id}-resume-label`}
                    aria-describedby={fileError ? `${id}-resume-error` : undefined}
                    onChange={e => chooseFile(e.target.files?.[0])}
                  />
                  Choose file
                </label>
              )}
              {fileError && <p id={`${id}-resume-error`} className="pp-error" role="alert">{fileError}</p>}
            </section>

            <fieldset className="pp-field pp-fieldset">
              <legend className="pp-label">Profile links</legend>
              <p className="pp-hint">Saved as references on your profile. We don't import anything from these sites.</p>
              <ReferenceInput id={`${id}-linkedin`} label="LinkedIn" value={linkedin} onChange={setLinkedin} error={linkedinError} forceShow={triedSubmit} />
              <ReferenceInput id={`${id}-imdb`} label="IMDb" value={imdb} onChange={setImdb} error={imdbError} forceShow={triedSubmit} />
            </fieldset>

            {photoSlot && (
              <section className="pp-field">
                <span className="pp-label">Profile photo</span>
                {photoSlot}
              </section>
            )}

            <div className="pp-field">
              <label className="pp-check">
                <input
                  type="checkbox"
                  checked={permission}
                  onChange={e => setPermission(e.target.checked)}
                  aria-describedby={triedSubmit && !permission ? `${id}-perm-error` : undefined}
                  required
                />
                <span>I confirm I have permission to use the materials I'm submitting.</span>
              </label>
              {triedSubmit && !permission && (
                <p id={`${id}-perm-error`} className="pp-error" role="alert">Please confirm you have permission to use these materials.</p>
              )}
              {triedSubmit && !hasMaterial && (
                <p className="pp-error" role="alert">Add a bio, a credit list, or a document to continue.</p>
              )}
            </div>
          </div>

          <footer className="pp-foot">
            {submitError && <p className="pp-error" role="alert">{submitError}</p>}
            <div className="pp-actions">
              <button type="button" className="pp-btn pp-btn--ghost" onClick={onCancel} disabled={submitting}>Cancel</button>
              <button type="submit" className="pp-btn pp-btn--primary" aria-disabled={!canSubmit} disabled={submitting}>
                {submitting ? 'Working…' : 'Suggest entries'}
              </button>
            </div>
          </footer>
        </form>
      </div>
    </>
  );
}

function Counter({ value, max }: { value: string; max: number }) {
  if (value.length < max * 0.8) return null;
  return <p className="pp-counter">{value.length.toLocaleString()} / {max.toLocaleString()} characters</p>;
}

function ReferenceInput({ id, label, value, onChange, error, forceShow }: {
  id: string; label: string; value: string; onChange: (v: string) => void; error: string | null; forceShow: boolean;
}) {
  const [touched, setTouched] = useState(false);
  const showError = (touched || forceShow) && error;
  return (
    <div className="pp-ref">
      <label htmlFor={id} className="pp-sublabel">{label}</label>
      <input
        id={id}
        type="url"
        inputMode="url"
        autoComplete="url"
        className="pp-input"
        value={value}
        onChange={e => onChange(e.target.value)}
        onBlur={() => setTouched(true)}
        aria-invalid={showError ? true : undefined}
        aria-describedby={showError ? `${id}-error` : undefined}
      />
      {showError && <p id={`${id}-error`} className="pp-error" role="alert">{error}</p>}
    </div>
  );
}
