import { describe, expect, it } from 'vitest';
import { isApiHandlerRequest } from '../../dev/api-dev-plugin.js';

describe('isApiHandlerRequest', () => {
  it('routes extensionless API paths to handlers', () => {
    expect(isApiHandlerRequest('/api/profile/suggest/extract-text')).toBe(true);
    expect(isApiHandlerRequest('/api/dev/mock-profile?key=empty')).toBe(true);
  });

  it('lets Vite serve source modules that live under api/', () => {
    expect(isApiHandlerRequest('/api/profile/suggest/_types.ts')).toBe(false);
    expect(isApiHandlerRequest('/api/profile/suggest/_types.ts?t=1')).toBe(false);
  });

  it('ignores non-API URLs', () => {
    expect(isApiHandlerRequest('/src/dev/main.tsx')).toBe(false);
    expect(isApiHandlerRequest(undefined)).toBe(false);
  });
});
