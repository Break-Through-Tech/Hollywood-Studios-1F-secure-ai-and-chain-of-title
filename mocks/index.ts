import { emptyProfile } from './profiles/empty.js';
import { populatedProfile } from './profiles/populated.js';
import type { MockProfileFixture } from './types.js';

export { mockEntities } from './entities.js';
export { emptyProfile, populatedProfile };
export type * from './types.js';

export const mockProfiles: Record<MockProfileFixture['key'], MockProfileFixture> = {
  empty: emptyProfile,
  populated: populatedProfile,
};
