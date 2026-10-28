/**
 * The suggestion schema is defined once, next to the API that produces it, and
 * re-exported here for the UI. _types.ts has no runtime dependencies, so the only
 * values this pulls into the bundle are its small option lists.
 */
export * from '../../../../api/profile/suggest/_types.js';
