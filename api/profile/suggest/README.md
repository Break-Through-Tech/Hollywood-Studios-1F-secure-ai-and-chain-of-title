# Profile auto-populate: API (feature folder)

Handlers for `/api/profile/suggest/<action>`. `_router.ts` maps action names to
underscore-prefixed handler files, matching the company's router/handler layout.
Copied into the company codebase as a unit at integration, then registered on the
profile router behind its existing session guard. Do not import from `mocks/`.
