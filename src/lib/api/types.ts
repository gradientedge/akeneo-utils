import * as https from 'https'
import { AkeneoAuthConfig } from '../auth'

/**
 * Configuration for constructing the {@see AkeneoApi} class.
 */
export interface AkeneoApiConfig extends AkeneoAuthConfig {
  retry?: AkeneoRetryConfig
  httpsAgent?: https.Agent
}

/**
 * Configuration for retrying a request when it fails
 */
export interface AkeneoRetryConfig {
  /**
   * The number of milliseconds to wait before retrying a failed request.
   * This will be increased exponentially {@see AkeneoApi.calculateDelay}.
   */
  delayMs: number

  /**
   * The maximum number of times that a request will be retried before
   * returning the error caught from the last failure.
   */
  maxRetries: number

  /**
   * If enabled, adds a random element to the exponential increase
   * in retry time. See the following url for more details:
   * https://aws.amazon.com/blogs/architecture/exponential-backoff-and-jitter/
   * We utilise the 'full' jitter + plus an additional decaying variance.
   */
  jitter?: boolean
}

export interface QueryProductsParams {
  /**
   * Filter products, for more details see https://api.akeneo.com/documentation/filter.html
   */
  search: string

  /**
   * Filter product values to return scopable attributes for the given channel as well as the
   * non localizable/non scopable attributes, for more details see
   * https://api.akeneo.com/documentation/filter.html#via-channel
   */
  scope: string

  /**
   * Filter product values to return localizable attributes for the given locales as well as the
   * non localizable/non scopable attributes, for more details see
   * https://api.akeneo.com/documentation/filter.html#via-locale
   */
  locales: string

  /**
   * Filter product values to only return those concerning the given attributes, for more
   * details see https://api.akeneo.com/documentation/filter.html#filter-product-values
   */
  attributes: string

  /**
   * Pagination method type, see https://api.akeneo.com/documentation/pagination.html
   */
  pagination_type: string

  /**
   * Number of the page to retrieve when using the `page` pagination method type.
   * Should never be set manually, see https://api.akeneo.com/documentation/pagination.html
   */
  page: number

  /**
   * Cursor when using the `search_after` pagination method type.
   * Should never be set manually, see https://api.akeneo.com/documentation/pagination.html
   */
  search_after: string

  /**
   * Number of results by page, see https://api.akeneo.com/documentation/pagination.html
   */
  limit: number

  /**
   * Return the count of items in the response. Be careful with this. On a big catalog,
   * it can decrease performance in a significant way
   */
  with_count: boolean

  /**
   * Return labels of attribute options in the response. (Only available since the 5.0 version)
   */
  with_attribute_options: boolean

  /**
   * Return product quality scores in the response. (Only available since the 5.0 version)
   */
  with_quality_scores: boolean

  /**
   * Return product completeness in the response. (Only available on SaaS platforms)
   */
  with_completenesses: boolean
}

export interface QueryProductModelsParams {
  /**
   * Filter products, for more details see https://api.akeneo.com/documentation/filter.html
   */
  search: string

  /**
   * Filter product values to return scopable attributes for the given channel as well as the
   * non localizable/non scopable attributes, for more details see
   * https://api.akeneo.com/documentation/filter.html#via-channel
   */
  scope: string

  /**
   * Filter product values to return localizable attributes for the given locales as well as the
   * non localizable/non scopable attributes, for more details see
   * https://api.akeneo.com/documentation/filter.html#via-locale
   */
  locales: string

  /**
   * Filter product values to only return those concerning the given attributes, for more
   * details see https://api.akeneo.com/documentation/filter.html#filter-product-values
   */
  attributes: string

  /**
   * Pagination method type, see https://api.akeneo.com/documentation/pagination.html
   */
  pagination_type: string

  /**
   * Number of the page to retrieve when using the `page` pagination method type.
   * Should never be set manually, see https://api.akeneo.com/documentation/pagination.html
   */
  page: number

  /**
   * Cursor when using the `search_after` pagination method type.
   * Should never be set manually, see https://api.akeneo.com/documentation/pagination.html
   */
  search_after: string

  /**
   * Number of results by page, see https://api.akeneo.com/documentation/pagination.html
   */
  limit: number

  /**
   * Return the count of items in the response. Be careful with this. On a big catalog,
   * it can decrease performance in a significant way
   */
  with_count: boolean

  /**
   * Return product quality scores in the response. (Only available since the 5.0 version)
   */
  with_quality_scores: boolean
}
