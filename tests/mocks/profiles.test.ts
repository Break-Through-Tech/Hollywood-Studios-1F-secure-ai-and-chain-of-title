import { describe, expect, it } from 'vitest';
import { CREDIT_DEPARTMENTS, CREDIT_WORK_TYPES } from '../../api/profile/suggest/_types.js';
import { mockEntities, mockProfiles } from '../../mocks/index.js';

describe('mock profiles', () => {
  it('empty profile has identity fields but no professional sections', () => {
    const { data } = mockProfiles.empty;
    expect(data.profile.display_name).toBeTruthy();
    expect(data.profile.headline).toBeTruthy();
    expect(data.profile.location).toBeTruthy();
    expect(data.profile.avatar_url).toBeTruthy();
    expect(data.profile.bio).toBeNull();
    expect(data.credits).toHaveLength(0);
    expect(data.experience).toHaveLength(0);
    expect(data.awards).toHaveLength(0);
    expect(data.profile.skills).toHaveLength(0);
    expect(data.profile.representation).toHaveLength(0);
  });

  it('populated profile fills every section and is marked as hand-edited', () => {
    const fixture = mockProfiles.populated;
    const { data } = fixture;
    expect(data.profile.bio).toBeTruthy();
    expect(data.credits.length).toBeGreaterThan(0);
    expect(data.experience.length).toBeGreaterThan(0);
    expect(data.awards.length).toBeGreaterThan(0);
    expect(data.profile.skills.length).toBeGreaterThan(0);
    expect(data.profile.representation.length).toBeGreaterThan(0);
    expect(fixture.manuallyEditedSections).toContain('credits');
  });

  it('keeps Producer and Executive Producer as distinct roles', () => {
    const roles = new Set(mockProfiles.populated.data.credits.map(c => c.role));
    expect(roles).toContain('Producer');
    expect(roles).toContain('Executive Producer');
  });

  it('uses the profile\'s department and work type options', () => {
    for (const c of mockProfiles.populated.data.credits) {
      expect(CREDIT_DEPARTMENTS).toContain(c.department);
      expect(CREDIT_WORK_TYPES).toContain(c.work_type);
    }
  });

  it('only references entities and credits that exist', () => {
    const entityIds = new Set(mockEntities.map(e => e.id));
    const { credits, profile } = mockProfiles.populated.data;
    for (const c of credits) if (c.entity_id !== null) expect(entityIds).toContain(c.entity_id);
    const creditIds = new Set(credits.map(c => c.id));
    for (const id of profile.featured_credit_ids) expect(creditIds).toContain(id);
  });

  it('uses only non-routable example addresses', () => {
    for (const { data } of Object.values(mockProfiles)) {
      expect(data.profile.email).toMatch(/\.invalid$/);
    }
  });
});
