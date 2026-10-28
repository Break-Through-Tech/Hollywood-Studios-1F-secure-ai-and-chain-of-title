import type { MockEntity } from './types.js';

/**
 * Invented title pages for local development. Includes a same-title remake pair
 * (ids 1 and 2) so matching and review can be exercised on that case.
 */
export const mockEntities: MockEntity[] = [
  { id: 1, type: 'movie', title: 'Harbor Lights', slug: 'harbor-lights-2004', year: 2004, image_url: null },
  { id: 2, type: 'movie', title: 'Harbor Lights', slug: 'harbor-lights-2022', year: 2022, image_url: null },
  { id: 3, type: 'tvshow', title: 'The Quiet Ledger', slug: 'the-quiet-ledger', year: 2016, image_url: null },
  { id: 4, type: 'movie', title: 'Copper Season', slug: 'copper-season', year: 2011, image_url: null },
  { id: 5, type: 'tvshow', title: 'Northbound', slug: 'northbound', year: 2019, image_url: null },
  { id: 6, type: 'movie', title: "Saint Clare's Hours", slug: 'saint-clares-hours', year: 2014, image_url: null },
];
