/**
 * Key used to store the validated code + user info in sessionStorage so the
 * dashboard can skip the second API call when the user arrives from the
 * landing page right after a successful validation.
 */
export const VALIDATION_CACHE_KEY = 'sc_validated'

/**
 * How long (in ms) the sessionStorage entry is considered fresh.
 * After this window the dashboard ignores the cached entry and re-validates.
 */
export const VALIDATION_CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes
