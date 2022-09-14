import { AkeneoAuthConfig } from './types'
import { AkeneoGrant } from './AkeneoGrant'
import { AkeneoAuthApi } from './AkeneoAuthApi'

/**
 * This interface used for holding the internal config of {@see AkeneoAuth}.
 * It's only purpose currently is to make the {@see Config.refreshIfWithinSecs} and
 * {@see Config.timeoutMs} properties mandatory after extending {@see AkeneoAuthConfig}
 * where those properties are optional. Default values for those properties are
 * defined on {@see configDefaults}.
 */
interface Config extends AkeneoAuthConfig {
  refreshIfWithinSecs: number
  timeoutMs: number
}

/**
 * Default values for a couple of the properties required by the {@see Config}
 * interface used in {@see AkeneoAuth.constructor}.
 */
const configDefaults = {
  refreshIfWithinSecs: 1800,
  timeoutMs: 5000,
}

/**
 * Provides an easy to use set of methods for communicating with the akeneo
 * HTTP Authorization API: https://api.akeneo.com/api-reference.html#Authentication
 *
 * An instance of this class is designed to be stored as a global, long-lived
 * object. If you're using a serverless environment such as AWS Lambda or an
 * Azure Function App, you can safely instantiate this class outside of your
 * function handler and have it exist for as long the serverless environment
 * allows.
 */
export class AkeneoAuth {
  /**
   * The internal configuration. This is a combination of the `AkeneoAuthConfig`
   * type passed in to the constructor and the default values specified in the
   * `configDefaults` object.
   */
  public readonly config: Config

  /**
   * This holds the client grant, once one has been generated.
   */
  private grant?: AkeneoGrant

  /**
   * Whenever we either refresh the client grant, or request a new one,
   * we don't want to allow any other requests to be initiated until that
   * request has completed. This promise is used to determine whether incoming
   * requests need to wait on an existing client grant request to complete
   * before they can start to be processed.
   */
  private grantPromise: Promise<any> = Promise.resolve()

  /**
   * The {@see AkeneoAuthApi} handles the actual sending of the request
   * and any lower level outgoing or incoming transformation of data.
   */
  private api: AkeneoAuthApi

  /**
   * Store the configuration locally and do some light validation to ensure
   * that we have some `clientScopes` defined. We also set a `member` called
   * {@see api} to an instance of {@see AkeneoAuthApi}, which handles
   * the lower level akeneo request.
   */
  constructor(config: AkeneoAuthConfig) {
    this.config = { ...configDefaults, ...config }

    this.api = new AkeneoAuthApi(config)
  }

  /**
   * Get a client grant
   *
   * If we don't already have a client grant stored locally, then we make a
   * call to akeneo to generate one. Once we have a grant, we store it
   * locally and then return that cached version up until it needs to be renewed.
   */
  public async getClientGrant(): Promise<AkeneoGrant> {
    await this.grantPromise

    if (this.grant && !this.grant.expiresWithin(this.config.refreshIfWithinSecs)) {
      return this.grant
    }

    this.grantPromise = this.api.getClientGrant()
    this.grant = new AkeneoGrant(await this.grantPromise)

    return this.grant
  }
}
