import type { MockProfileFixture } from '../types.js';

/**
 * Use case: an existing member whose profile has a name, photo, role and location,
 * but whose professional sections are empty. Entirely fictional.
 */
export const emptyProfile: MockProfileFixture = {
  key: 'empty',
  useCase: 'Existing profile with empty professional sections; populate it from supplied materials.',
  manuallyEditedSections: ['headline', 'location'],
  data: {
    profile: {
      id: 101,
      email: 'marisol.teague@example.invalid',
      handle: 'marisol-teague',
      display_name: 'Marisol Teague',
      headline: 'Director',
      bio: null,
      location: 'Atlanta, GA',
      avatar_url: '/mock/avatar-marisol.svg',
      skills: [],
      representation: [],
      media_links: [],
      featured_credit_ids: [],
    },
    credits: [],
    experience: [],
    awards: [],
  },
};
