import type { MockProfileFixture } from '../types.js';

/**
 * Use case: a fully populated profile the member has curated by hand. The feature
 * should only fill gaps and must never silently overwrite these values.
 * Entirely fictional.
 */
export const populatedProfile: MockProfileFixture = {
  key: 'populated',
  useCase: 'Fully populated, manually edited profile; fill gaps without losing existing edits.',
  manuallyEditedSections: ['bio', 'headline', 'location', 'experience', 'skills', 'credits', 'representation', 'awards'],
  data: {
    profile: {
      id: 102,
      email: 'julian.ashcombe@example.invalid',
      handle: 'julian-ashcombe',
      display_name: 'Sir Julian Ashcombe',
      headline: 'Producer & Founder, Larkspur Pictures',
      bio:
        'Sir Julian Ashcombe is a British-American producer and the founder of Larkspur Pictures. ' +
        'Over three decades he has produced character-driven dramas for film and television, ' +
        "including the original Harbor Lights and the limited series Northbound. He was knighted " +
        'for services to the arts and mentors early-career producers through the Larkspur Fellowship.',
      location: 'London, UK / Los Angeles, CA',
      avatar_url: '/mock/avatar-julian.svg',
      skills: ['Film Financing', 'Development', 'Packaging', 'International Co-Productions'],
      representation: [
        { name: 'Dana Whitlock', company: 'Meridian Talent Group', role: 'Agent', email: 'dana@meridian.example.invalid' },
        { name: 'Theo Barros', company: 'Barros & Lane LLP', role: 'Attorney' },
      ],
      media_links: [
        { url: 'https://example.invalid/larkspur/reel', title: 'Larkspur Pictures reel', type: 'video' },
      ],
      featured_credit_ids: [1002, 1001, 1004],
    },
    credits: [
      { id: 1001, department: 'Producing', title: 'Harbor Lights', year: 2004, role: 'Producer', work_type: 'Film', sort_order: 0, entity_id: 1 },
      { id: 1002, department: 'Producing', title: 'Northbound', year: 2019, role: 'Executive Producer', work_type: 'TV', sort_order: 1, entity_id: 5 },
      { id: 1003, department: 'Producing', title: 'Copper Season', year: 2011, role: 'Producer', work_type: 'Film', sort_order: 2, entity_id: 4 },
      { id: 1004, department: 'Producing', title: 'The Quiet Ledger', year: 2016, role: 'Executive Producer', work_type: 'TV', sort_order: 3, entity_id: 3 },
    ],
    experience: [
      { id: 2001, company: 'Larkspur Pictures', job_title: 'Founder & Principal', start_date: '1998-03-01', end_date: null, description: 'Independent production company for film and premium television.' },
      { id: 2002, company: 'Greyfield Studios', job_title: 'Vice President, Development', start_date: '1991-06-01', end_date: '1998-02-01', description: null },
    ],
    awards: [
      { id: 3001, award_name: 'Coastline Film Critics Award', category: 'Best Picture', year: 2005, result: 'Won', project: 'Harbor Lights' },
      { id: 3002, award_name: 'Golden Lantern Television Awards', category: 'Outstanding Limited Series', year: 2020, result: 'Nominated', project: 'Northbound' },
    ],
  },
};
