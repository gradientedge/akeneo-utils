import { AkeneoBaseConfig } from '../types'

/**
 * Configuration for {@see AkeneoAuth}
 */
export interface AkeneoAuthConfig extends AkeneoBaseConfig {
  refreshIfWithinSecs?: number
}

/**
 * Configuration for {@see AkeneoAuthApi}
 */
export interface AkeneoAuthApiConfig {
  endpoint: string
  username: string
  password: string
  clientId: string
  clientSecret: string
  timeoutMs?: number
}

/**
 * The object structure that we receive back from akeneo
 * on a successful call to get a new grant, or refresh an existing one.
 */
export interface AkeneoGrantResponse {
  access_token: string
  refresh_token?: string
  expires_in: number
}

/**
 * Authentication grant types.
 * These are used when populating the 'grant_type' parameter.
 */
export enum GrantType {
  REFRESH_TOKEN = 'refresh_token',
  /**
   * Used when attempting to login a customer:
   * https://docs.akeneo.com/api/authorization#password-flow
   */
  PASSWORD = 'password',
}
