/**
 * Provides a base configuration definition from which other class
 * specific configurations can be extended.
 */
export interface AkeneoBaseConfig {
  endpoint: string
  username: string
  password: string
  clientId: string
  clientSecret: string
  timeoutMs?: number
}
