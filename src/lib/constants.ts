/**
 * The standard request timeout value (in milliseconds). We pass
 * this to `axios` when making the request to Akeneo.
 */
export const DEFAULT_REQUEST_TIMEOUT_MS = 5000

/**
 * Number of milliseconds that the request will be delayed for when
 * the `Retry-After` header value is missing or invalid.
 */
export const DEFAULT_429_DELAY_MS = 5000

/**
 * Maximum number of items per page when querying for any type of items
 */
export const MAX_ITEMS_PER_PAGE = 100
