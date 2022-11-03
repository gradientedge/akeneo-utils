import axios, { AxiosInstance } from 'axios'
import qs from 'qs'
import {
  AkeneoApiConfig,
  AkeneoRetryConfig,
  DeleteAssetParams,
  DeleteProductModelParams,
  DeleteProductParams,
  GetAssetParams,
  GetFamilyParams,
  GetListOfAssetsParams,
  GetListOfAttributeOptionsParams,
  GetListOfAttributesParams,
  GetListOfCategoriesParams,
  GetListOfFamiliesParams,
  GetListOfFamilyVariantsParams,
  GetListOfProductModelsParams,
  GetListOfProductsParams,
  GetListOfReferenceEntitiesParams,
  GetListOfReferenceEntityRecordsParams,
  GetProductModelParams,
  GetProductParams,
} from './types'
import {
  AkeneoAuth,
  Asset,
  Attribute,
  AttributeOption,
  Category,
  Family,
  FamilyVariant,
  ReferenceEntity,
  ReferenceEntityRecord,
} from '../'
import { AkeneoError } from '../error'
import { DEFAULT_REQUEST_TIMEOUT_MS } from '../constants'
import { calculateDelay } from '../utils'
import { Status } from '@tshttp/status'
import { Product, ProductModel, Results } from '../types'

export interface FetchOptions<T = Record<string, any>> {
  /**
   * Path of the REST endpoint
   *
   * This is the absolute path, without the host/schema/port etc.
   *
   * Example: `/products`
   */
  path?: string | undefined

  /**
   * URL to follow
   *
   * This must be provided if the {@see path} property is undefined
   */
  url?: string | undefined

  /**
   * Key/value pairs representing the HTTP headers to send
   *
   * You can pass in any headers you like using this property, however
   * this is generally not necessary, as the {@see AkeneoApi.request}
   * method applies all necessary headers.
   *
   * You should specifically avoid setting values for the following headers:
   *
   *  - `Authorization`
   *  - `Content-Type`
   *
   * All of the above are set by the `AkeneoApi` class.
   *
   * Example value:
   *
   * ```
   * {
   *   ...
   *   headers: {
   *     'X-My-Special-Header': 'MyCustomValue'
   *   }
   *   ...
   * }
   * ```
   */
  headers?: Record<string, string>

  /**
   * HTTP method to use when sending the request
   */
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE' | 'HEAD'

  /**
   * Querystring parameters to send with the request
   *
   * Key/value pairs that are then converted in to a querystring
   * using the `qs` npm package. See the `paramSerializer` option
   * in {@see AkeneoApi.createAxiosInstance} for
   * implementation details.
   */
  params?: Record<string, any>

  /**
   * Plain JavaScript object containing the payload to send as JSON
   *
   * This object will be converted to a JSON string and sent as the body
   * of a `POST` or `DELETE` request.
   */
  data?: T

  /**
   * Request retry configuration
   *
   * The request retry configuration can be set on the `AkeneoApi`
   * instance or on a request by request basis. If no value is passed in
   * here, we fall back to using the configuration provided when constructing
   * the `AkeneoApi` instance. If no value was passed in to the
   * constructor configuration, then no retries will take place.
   */
  retry?: AkeneoRetryConfig
}

/**
 * Default retry configuration - equates to no retying at all
 */
const DEFAULT_RETRY_CONFIG: AkeneoRetryConfig = {
  maxRetries: 0,
  delayMs: 0,
}

/**
 * List of status codes which are allowed to retry
 */
const RETRYABLE_STATUS_CODES: number[] = [
  Status.InternalServerError,
  Status.NotImplemented,
  Status.BadGateway,
  Status.ServiceUnavailable,
  Status.GatewayTimeout,
]

/**
 * The config options passed in to the {@see HttpsAgent.Agent} used
 * with the axios instance that we create.
 */
const DEFAULT_HTTPS_AGENT_CONFIG = {
  keepAlive: true,
  maxSockets: 32,
  maxFreeSockets: 10,
  timeout: 60000,
}

/**
 * Options that are available to all requests.
 */
export interface CommonRequestOptions {
  /**
   * Query string parameters. For repeated param=value in the query string, define an array with values
   */
  params?: Record<string, undefined | string | boolean | number | (string | boolean | number)[]>

  /**
   * Retry configuration
   */
  retry?: AkeneoRetryConfig
}

/**
 * A collection of convenience methods for interacting with the
 * akeneo API.
 */
export class AkeneoApi {
  /**
   * This is the instance of the {@see AkeneoAuth} class that
   * this class uses internally. It's exposed publicly so that it can
   * be used by consumer's of this class in order to access authorization
   * API related functionality.
   */
  public readonly auth: AkeneoAuth

  /**
   * The configuration passed in to the constructor.
   */
  public readonly config: AkeneoApiConfig

  /**
   * The API endpoint
   */
  public readonly endpoint: string

  /**
   * axios instance
   */
  private readonly axios: AxiosInstance

  /**
   * The default retry configuration for the instance. This can be overridden
   * on a method by method basis.
   */
  private readonly retry: AkeneoRetryConfig

  constructor(config: AkeneoApiConfig) {
    AkeneoApi.validateConfig(config)
    this.config = config
    this.auth = new AkeneoAuth(config)
    this.endpoint = `${this.config.endpoint}/api/rest/v1`
    this.axios = this.createAxiosInstance()
    this.retry = config.retry || DEFAULT_RETRY_CONFIG
  }

  /**
   * Get a list of categories
   * https://api.akeneo.com/api-reference.html#get_categories
   */
  async getListOfCategories(options: GetListOfCategoriesParams): Promise<Results<Category>> {
    const response = await this.request({
      ...this.extractCommonRequestOptions(options),
      path: `/categories`,
      method: 'GET',
    })
    if (options?.fetchAll) {
      await this.appendRemainingPages({ response })
    }
    return response
  }

  /**
   * Get a product
   * https://api.akeneo.com/api-reference.html#get_products__code_
   */
  getProduct(options: CommonRequestOptions & GetProductParams): Promise<Product> {
    return this.request({
      ...this.extractCommonRequestOptions(options),
      path: `/products/${options.code}`,
      method: 'GET',
    })
  }

  /**
   * Delete a product
   * https://api.akeneo.com/api-reference.html#delete_products__code_
   */
  deleteProduct(options: CommonRequestOptions & DeleteProductParams): Promise<void> {
    return this.request({
      ...this.extractCommonRequestOptions(options),
      path: `/products/${options.code}`,
      method: 'DELETE',
    })
  }

  /**
   * Get a list of products
   * https://api.akeneo.com/api-reference.html#get_products
   */
  async getListOfProducts(options?: GetListOfProductsParams): Promise<Results<Product>> {
    const response = await this.request({
      ...this.extractCommonRequestOptions(options),
      path: `/products`,
      method: 'GET',
    })
    if (options?.fetchAll) {
      await this.appendRemainingPages({ response })
    }
    return response
  }

  /**
   * Get a product model
   * https://api.akeneo.com/api-reference.html#get_product_models__code_
   */
  getProductModel(options: CommonRequestOptions & GetProductModelParams): Promise<ProductModel> {
    return this.request({
      ...this.extractCommonRequestOptions(options),
      path: `/product-models/${options.code}`,
      method: 'GET',
    })
  }

  /**
   * Delete a product model
   * https://api.akeneo.com/api-reference.html#delete_product_models__code_
   */
  deleteProductModel(options: DeleteProductModelParams): Promise<void> {
    return this.request({
      ...this.extractCommonRequestOptions(options),
      path: `/product-models/${options.code}`,
      method: 'DELETE',
    })
  }

  /**
   * Get a list of families
   * https://api.akeneo.com/api-reference.html#get_families
   */
  async getListOfFamilies(options?: GetListOfFamiliesParams): Promise<Results<Family>> {
    const response = await this.request({
      ...this.extractCommonRequestOptions(options),
      path: `/families`,
      method: 'GET',
    })
    if (options?.fetchAll) {
      await this.appendRemainingPages({ response })
    }
    return response
  }

  /**
   * Get a family
   * https://api.akeneo.com/api-reference.html#get_families__code_
   */
  async getFamily(options: GetFamilyParams): Promise<Family> {
    return await this.request({
      ...this.extractCommonRequestOptions(options),
      path: `/families/${options.code}`,
      method: 'GET',
    })
  }

  /**
   * Get a list of family variants
   * https://api.akeneo.com/api-reference.html#get_families__family_code__variants
   */
  async getListOfFamilyVariants(options: GetListOfFamilyVariantsParams): Promise<Results<FamilyVariant>> {
    const response = await this.request({
      ...this.extractCommonRequestOptions(options),
      path: `/families/${encodeURIComponent(options.code)}/variants`,
      method: 'GET',
    })
    if (options?.fetchAll) {
      await this.appendRemainingPages({ response })
    }
    return response
  }

  /**
   * Get a list of product models
   * https://api.akeneo.com/api-reference.html#get_product_models
   */
  async getListOfProductModels(options?: GetListOfProductModelsParams): Promise<Results<ProductModel>> {
    const response = await this.request<any, Results<ProductModel>>({
      ...this.extractCommonRequestOptions(options),
      path: `/product-models`,
      method: 'GET',
    })
    if (options?.fetchAll) {
      await this.appendRemainingPages({ response })
    }
    return response
  }

  /**
   * Get list of attributes
   * https://api.akeneo.com/api-reference.html#get_attributes__attribute_code__options
   */
  async getListOfAttributes(options: CommonRequestOptions & GetListOfAttributesParams): Promise<Results<Attribute>> {
    const response = await this.request({
      ...this.extractCommonRequestOptions(options),
      path: `/attributes`,
      method: 'GET',
    })
    if (options?.fetchAll) {
      await this.appendRemainingPages({ response })
    }
    return response
  }

  /**
   * Get list of attribute options
   * https://api.akeneo.com/api-reference.html#get_attributes__attribute_code__options
   */
  async getListOfAttributeOptions(
    options: CommonRequestOptions & GetListOfAttributeOptionsParams,
  ): Promise<Results<AttributeOption>> {
    const response = await this.request({
      ...this.extractCommonRequestOptions(options),
      path: `/attributes/${options.attributeCode}/options`,
      method: 'GET',
    })
    if (options?.fetchAll) {
      await this.appendRemainingPages({ response })
    }
    return response
  }

  /**
   * Get a list of reference entities
   * https://api.akeneo.com/api-reference.html#get_reference_entities
   */
  async getListOfReferenceEntities(
    options: CommonRequestOptions & GetListOfReferenceEntitiesParams,
  ): Promise<Results<ReferenceEntity>> {
    const response = await this.request({
      ...this.extractCommonRequestOptions(options),
      path: `/reference-entities`,
      method: 'GET',
    })
    if (options?.fetchAll) {
      await this.appendRemainingPages({ response })
    }
    return response
  }

  /**
   * Get a list of reference entity records
   * https://api.akeneo.com/api-reference.html#get_reference_entity_records
   */
  async getListOfReferenceEntityRecords(
    options: GetListOfReferenceEntityRecordsParams,
  ): Promise<Results<ReferenceEntityRecord>> {
    const response = await this.request({
      ...this.extractCommonRequestOptions(options),
      path: `/reference-entities/${options.referenceEntityCode}/records`,
      method: 'GET',
    })
    if (options?.fetchAll) {
      await this.appendRemainingPages({ response })
    }
    return response
  }

  /**
   * Get a list of assets for a given asset family code
   * https://api.akeneo.com/api-reference.html#get_assets__code_
   */
  async getListOfAssets(options: GetListOfAssetsParams): Promise<Asset> {
    const response = await this.request({
      ...this.extractCommonRequestOptions(options),
      path: `/asset-families/${options.assetFamilyCode}/assets`,
      method: 'GET',
    })
    if (options?.fetchAll) {
      await this.appendRemainingPages({ response })
    }
    return response
  }

  /**
   * Get an asset based on it's code and asset family code
   * https://api.akeneo.com/api-reference.html#get_assets__code_
   */
  async getAsset(options: GetAssetParams): Promise<Asset> {
    return await this.request({
      ...this.extractCommonRequestOptions(options),
      path: `/asset-families/${options.assetFamilyCode}/assets/${options.code}`,
      method: 'GET',
    })
  }

  /**
   * Delete an asset based on it's code and asset family code
   * https://api.akeneo.com/api-reference.html#delete_assets__code_
   */
  async deleteAsset(options: DeleteAssetParams): Promise<void> {
    return await this.request({
      ...this.extractCommonRequestOptions(options),
      path: `/asset-families/${options.assetFamilyCode}/assets/${options.code}`,
      method: 'DELETE',
    })
  }

  /**
   * Get a list of reference entities
   * https://api.akeneo.com/api-reference.html#get_reference_entities
   */
  followLink<T = any>(options: { url: string }): Promise<Results<T>> {
    return this.request({
      method: 'GET',
      url: options.url,
    })
  }

  /**
   * Get all pages for a given {@see Results} object
   */
  async appendRemainingPages(options: { response: Results }) {
    let nextHref = options.response._links.next?.href
    while (nextHref) {
      const nextResponse = await this.followLink({ url: nextHref })
      options.response._embedded.items.push(...nextResponse._embedded.items)
      nextHref = nextResponse._links.next?.href
    }
    options.response._links = {
      first: options.response._links.first,
    }
  }

  getClientGrant() {
    return this.auth.getClientGrant()
  }

  /**
   * Define the base axios instance that forms the foundation
   * of all axios calls made by the {@see request} method.
   */
  createAxiosInstance() {
    let agent
    try {
      if (process.env.GEAKU_IS_BROWSER !== '1') {
        if (this.config.httpsAgent) {
          agent = this.config.httpsAgent
        } else {
          const https = require('https')
          agent = new https.Agent(DEFAULT_HTTPS_AGENT_CONFIG)
        }
      }
    } catch (e) {}

    const instance = axios.create({
      timeout: this.config.timeoutMs || DEFAULT_REQUEST_TIMEOUT_MS,
      paramsSerializer: function (params: any) {
        return qs.stringify(params, { arrayFormat: 'repeat' })
      },
      httpsAgent: agent,
    })
    instance.defaults.headers.common.Accept = 'application/json'
    instance.defaults.headers.common['User-Agent'] = ''

    return instance
  }

  /**
   * Make the request to the akeneo REST API.
   */
  async request<T = any, R = any>(options: FetchOptions<T>): Promise<R> {
    const requestConfig = await this.getRequestOptions(options)
    const retryConfig = this.getRetryConfig(options.retry)
    let retryCount = 0
    let lastError: any

    do {
      if (retryCount > 0) {
        const delay = calculateDelay(retryCount, retryConfig)
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
      try {
        const response = await this.axios(requestConfig)
        return response.data
      } catch (error) {
        if (this.isRetryableError(error)) {
          lastError = error
        } else {
          throw this.transformError(error)
        }
      }
      retryCount++
    } while (retryCount <= retryConfig.maxRetries)

    throw this.transformError(lastError)
  }

  /**
   * Get the {@see AkeneoRetryConfig} for this request.
   * Uses the class instance's retry config and merges and additional
   * config passed in via the request options.
   */
  getRetryConfig(methodRetryConfig?: AkeneoRetryConfig) {
    return methodRetryConfig || this.retry
  }

  /**
   * Generate request options. These are then fed in to axios when
   * making the request to akeneo.
   */
  async getRequestOptions(options: FetchOptions) {
    const url = options.url ?? `${this.endpoint}${options.path}`
    const opts: any = { ...options }
    opts.path && delete opts.path
    opts.url && delete opts.url

    const grant = await this.auth.getClientGrant()

    const headers = {
      ...this.axios.defaults.headers,
      Authorization: `Bearer ${grant.accessToken}`,
      ...opts.headers,
    }
    return { ...opts, url, headers }
  }

  /**
   * Determine whether the given error means we should allow the request
   * to be retried (assuming retry config is provided).
   */
  isRetryableError(error: any) {
    // If the error isn't an axios error, then something serious
    // went wrong. Probably a coding error in this package. We should
    // never really hit this scenario.
    if (!error.isAxiosError) {
      return true
    }
    // If axios makes a request successfully, the `request` property will
    // be defined. Equally, if it received a response, the `response` property
    // will be defined. If either is not defined then we assume there was
    // a serious connectivity issue and allow the request to be retried.
    if (!error.request || !error.response) {
      return true
    }
    // Finally we only allow requests to be retried if the status code
    // returned is in the given list
    return RETRYABLE_STATUS_CODES.includes(error.response.status)
  }

  /**
   * Type-guard against any additional unexpected properties being passed in.
   */
  extractCommonRequestOptions(options?: CommonRequestOptions): CommonRequestOptions {
    if (!options) {
      return {}
    }
    return {
      params: options.params,
      retry: options.retry,
    }
  }

  /**
   * Transform an unknown error in to a {@see AkeneoError}
   * if the error we receive is from axios.
   */
  transformError(lastError: any) {
    if (lastError.isAxiosError) {
      return AkeneoError.fromAxiosError(lastError)
    }
    return lastError
  }

  /**
   * Ensure that all required properties on the {@see AkeneoApiConfig}
   * object have been populated. These are currently:
   *
   *   clientId: string
   *   clientSecret: string
   */
  public static validateConfig(config: any) {
    const errors: string[] = []
    if (!config) {
      errors.push('The config object missing or empty')
    } else {
      if (!config.endpoint) {
        errors.push('The `endpoint` property is empty')
      } else if (typeof config.endpoint !== 'string') {
        errors.push('The `endpoint` property must be a string')
      } else {
        try {
          new URL(config.endpoint)
        } catch (e: any) {
          errors.push('The `endpoint` property is not a valid URL')
        }
      }
      if (!config.username) {
        errors.push('The `username` property is empty')
      } else if (typeof config.username !== 'string') {
        errors.push('The `username` property must be a string')
      }
      if (!config.password) {
        errors.push('The `password` property is empty')
      } else if (typeof config.password !== 'string') {
        errors.push('The `password` property must be a string')
      }
      if (!config.clientId) {
        errors.push('The `clientId` property is empty')
      } else if (typeof config.clientId !== 'string') {
        errors.push('The `clientId` property must be a string')
      }
      if (!config.clientSecret) {
        errors.push('The `clientSecret` property is empty')
      } else if (typeof config.clientSecret !== 'string') {
        errors.push('The `clientSecret` property must be a string')
      }
    }

    if (errors.length) {
      throw new AkeneoError(
        'The configuration object passed in to the `AkeneoApi` constructor is not valid: \n' +
          errors.map((error) => `• ${error}`).join('\n'),
      )
    }
  }
}
