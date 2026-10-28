import { useEffect, useState } from 'react';
import type { MockProfileFixture } from '../../mocks/types';
import { extractResumeText } from '../components/profile/suggest/api';
import { PopulateProfile } from '../components/profile/suggest/PopulateProfile';
import type { PopulateSubmission } from '../components/profile/suggest/PopulateProfile';
import type { ExtractTextResponse } from '../components/profile/suggest/types';

interface Received {
  submission: Omit<PopulateSubmission, 'resumeFile'> & { resumeFile: string | null };
  resume: ExtractTextResponse | null;
}

type Key = MockProfileFixture['key'];

/**
 * Dev harness only: lets us load a mock profile and mount feature components
 * against it. Not part of the feature; never copied into the company codebase.
 */
export function DevApp() {
  const [key, setKey] = useState<Key>('empty');
  const [fixture, setFixture] = useState<MockProfileFixture | null>(null);
  const [error, setError] = useState('');
  const [received, setReceived] = useState<Received | null>(null);

  const handleSubmit = async (submission: PopulateSubmission) => {
    const resume = submission.resumeFile ? await extractResumeText(submission.resumeFile) : null;
    setReceived({ submission: { ...submission, resumeFile: submission.resumeFile?.name ?? null }, resume });
  };

  useEffect(() => {
    let cancelled = false;
    setError('');
    fetch(`/api/dev/mock-profile?key=${key}`)
      .then(res => (res.ok ? res.json() : Promise.reject(new Error(`HTTP ${res.status}`))))
      .then((json: MockProfileFixture) => { if (!cancelled) setFixture(json); })
      .catch((err: Error) => { if (!cancelled) setError(err.message); });
    return () => { cancelled = true; };
  }, [key]);

  const data = fixture?.data;

  return (
    <main className="dev-shell">
      <header className="dev-bar">
        <strong>Profile Auto-Populate · dev harness</strong>
        <label>
          Mock profile{' '}
          <select value={key} onChange={e => setKey(e.target.value as Key)}>
            <option value="empty">Empty professional sections</option>
            <option value="populated">Fully populated, manually edited</option>
          </select>
        </label>
      </header>

      {error && <p className="dev-error">Could not load mock profile: {error}</p>}

      {data && (
        <section className="dev-card">
          <div className="dev-profile-head">
            {data.profile.avatar_url && <img src={data.profile.avatar_url} alt="" width={64} height={64} />}
            <div>
              <h1>{data.profile.display_name}</h1>
              <p>{data.profile.headline} · {data.profile.location}</p>
            </div>
          </div>
          <p className="dev-muted">{fixture.useCase}</p>
          <ul className="dev-counts">
            <li>Bio: {data.profile.bio ? 'filled' : 'empty'}</li>
            <li>Credits: {data.credits.length}</li>
            <li>Experience: {data.experience.length}</li>
            <li>Skills: {data.profile.skills.length}</li>
            <li>Representation: {data.profile.representation.length}</li>
            <li>Awards: {data.awards.length}</li>
          </ul>
          <div className="dev-actions">
            <PopulateProfile onSubmit={handleSubmit} photoSlot={<p className="dev-muted">Photo upload (Photos team) plugs in here.</p>} />
          </div>
        </section>
      )}

      {received && (
        <section className="dev-card">
          <h2 className="dev-h2">Received by the next step (Task 5 will turn this into suggestions)</h2>
          <pre className="dev-pre">{JSON.stringify(received.submission, null, 2)}</pre>
          {received.resume && (
            <>
              <h3 className="dev-h3">
                Résumé text · {received.resume.kind.toUpperCase()} · {received.resume.charCount.toLocaleString()} chars
                {received.resume.truncated && ' · truncated'}
              </h3>
              <pre className="dev-pre">{received.resume.text}</pre>
            </>
          )}
        </section>
      )}
    </main>
  );
}
