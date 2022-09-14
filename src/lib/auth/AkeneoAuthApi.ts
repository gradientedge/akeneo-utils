import { AkeneoAuthApiConfig, AkeneoGrantResponse, GrantType } from './types'
import { AkeneoError } from '../'
import { base64EncodeForBasicAuth } from './utils'
import axios, { Method } from 'axios'
import { DEFAULT_REQUEST_TIMEOUT_MS } from '../constants'

/**
 * Provides an easy to use set of methods for communicating with the akeneo
 * HTTP Authorization API
 */
export class AkeneoAuthApi {
  /**
   * The internal configuration. This is a combination of the `AkeneoAuthConfig`
   * type passed in to the constructor and the default values specified in the
   * `configDefaults` object.
   */
  public readonly config: AkeneoAuthApiConfig

  /**
   * The Auth and API endpoints driven by the user's setting of {@link AkeneoAuthApiConfig.region}
   * https://docs.akeneo.com/api/general-concepts#regions
   */
  public readonly endpoint: string

  constructor(config: AkeneoAuthApiConfig) {
    this.config = config
    this.endpoint = `${this.config.endpoint}/api/oauth/v1`
  }

  /**
   * Get a new client grant:
   * https://docs.akeneo.com/api/authorization#client-credentials-flow
   */
  public async getClientGrant(): Promise<AkeneoGrantResponse> {
    return this.post('/token', {
      grant_type: GrantType.PASSWORD,
      username: this.config.username,
      password: this.config.password,
    })
  }

  /**
   * Construct and send a request to the akeneo auth endpoint.
   */
  public async post(path: string, body: Record<string, any>): Promise<AkeneoGrantResponse> {
    const options = {
      url: `${this.endpoint}${path}`,
      method: 'POST' as Method,
      data: body,
    }
    const headers: any = {
      Authorization: `Basic ${base64EncodeForBasicAuth(this.config.clientId, this.config.clientSecret)}`,
      'Content-Type': 'application/json',
      'User-Agent': undefined,
    }
    try {
      const response = await axios({
        ...options,
        headers,
        timeout: this.config.timeoutMs || DEFAULT_REQUEST_TIMEOUT_MS,
      })
      return response.data
    } catch (error: any) {
      if (error.isAxiosError) {
        throw AkeneoError.fromAxiosError(error)
      }
      throw error
    }
  }
}
