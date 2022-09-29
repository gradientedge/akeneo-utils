import * as https from 'https'
import { AkeneoAuthConfig } from '../auth'
import { CommonRequestOptions } from './AkeneoApi'

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

export interface GetProductModelParams extends CommonRequestOptions {
  /**
   * The product code
   */
  code: string

  params?: {
    /**
     * Return product quality scores in the response. (Only available since the 5.0 version)
     */
    with_quality_scores?: boolean | undefined
  }
}

export interface GetProductParams extends CommonRequestOptions {
  /**
   * The product code
   */
  code: string

  params?: {
    /**
     * Return labels of attribute options in the response. (Only available since the 5.0 version)
     */
    with_attribute_options?: boolean | undefined

    /**
     * Return product quality scores in the response. (Only available since the 5.0 version)
     */
    with_quality_scores?: boolean | undefined

    /**
     * Return product completeness in the response. (Only available on SaaS platforms)
     */
    with_completenesses?: boolean | undefined
  }
}

export interface GetListOfProductsParams extends CommonRequestOptions {
  /** Whether the `_links.next.href` should be followed until all pages are loaded */
  fetchAll?: boolean | undefined

  params?: {
    /**
     * Filter products, for more details see https://api.akeneo.com/documentation/filter.html
     */
    search?: string | undefined

    /**
     * Filter product values to return scopable attributes for the given channel as well as the
     * non localizable/non scopable attributes, for more details see
     * https://api.akeneo.com/documentation/filter.html#via-channel
     */
    scope?: string | undefined

    /**
     * Filter product values to return localizable attributes for the given locales as well as the
     * non localizable/non scopable attributes, for more details see
     * https://api.akeneo.com/documentation/filter.html#via-locale
     */
    locales?: string | undefined

    /**
     * Filter product values to only return those concerning the given attributes, for more
     * details see https://api.akeneo.com/documentation/filter.html#filter-product-values
     */
    attributes?: string | undefined

    /**
     * Pagination method type, see https://api.akeneo.com/documentation/pagination.html
     */
    pagination_type?: string | undefined

    /**
     * Number of the page to retrieve when using the `page` pagination method type.
     * Should never be set manually, see https://api.akeneo.com/documentation/pagination.html
     */
    page?: number | undefined

    /**
     * Cursor when using the `search_after` pagination method type.
     * Should never be set manually, see https://api.akeneo.com/documentation/pagination.html
     */
    search_after?: string | undefined

    /**
     * Number of results by page, see https://api.akeneo.com/documentation/pagination.html
     */
    limit?: number | undefined

    /**
     * Return the count of items in the response. Be careful with this. On a big catalog,
     * it can decrease performance in a significant way
     */
    with_count?: boolean | undefined

    /**
     * Return labels of attribute options in the response. (Only available since the 5.0 version)
     */
    with_attribute_options?: boolean | undefined

    /**
     * Return product quality scores in the response. (Only available since the 5.0 version)
     */
    with_quality_scores?: boolean | undefined

    /**
     * Return product completeness in the response. (Only available on SaaS platforms)
     */
    with_completenesses?: boolean | undefined
  }
}

export interface GetListOfProductModelsParams extends CommonRequestOptions {
  /** Whether the `_links.next.href` should be followed until all pages are loaded */
  fetchAll?: boolean | undefined

  params?: {
    /**
     * Filter products, for more details see https://api.akeneo.com/documentation/filter.html
     */
    search?: string | undefined

    /**
     * Filter product values to return scopable attributes for the given channel as well as the
     * non localizable/non scopable attributes, for more details see
     * https://api.akeneo.com/documentation/filter.html#via-channel
     */
    scope?: string | undefined

    /**
     * Filter product values to return localizable attributes for the given locales as well as the
     * non localizable/non scopable attributes, for more details see
     * https://api.akeneo.com/documentation/filter.html#via-locale
     */
    locales?: string | undefined

    /**
     * Filter product values to only return those concerning the given attributes, for more
     * details see https://api.akeneo.com/documentation/filter.html#filter-product-values
     */
    attributes?: string | undefined

    /**
     * Pagination method type, see https://api.akeneo.com/documentation/pagination.html
     */
    pagination_type?: string | undefined

    /**
     * Number of the page to retrieve when using the `page` pagination method type.
     * Should never be set manually, see https://api.akeneo.com/documentation/pagination.html
     */
    page?: number | undefined

    /**
     * Cursor when using the `search_after` pagination method type.
     * Should never be set manually, see https://api.akeneo.com/documentation/pagination.html
     */
    search_after?: string | undefined

    /**
     * Number of results by page, see https://api.akeneo.com/documentation/pagination.html
     */
    limit?: number | undefined

    /**
     * Return the count of items in the response. Be careful with this. On a big catalog,
     * it can decrease performance in a significant way
     */
    with_count?: boolean | undefined

    /**
     * Return product quality scores in the response. (Only available since the 5.0 version)
     */
    with_quality_scores?: boolean | undefined
  }
}

export interface GetListOfAttributeOptionsParams extends CommonRequestOptions {
  /** Whether the `_links.next.href` should be followed until all pages are loaded */
  fetchAll?: boolean | undefined

  /** The attribute code */
  attributeCode: string

  params?: {
    /**
     * Number of the page to retrieve
     * Should never be set manually, see https://api.akeneo.com/documentation/pagination.html
     */
    page?: number | undefined

    /**
     * Number of results by page, see https://api.akeneo.com/documentation/pagination.html
     */
    limit?: number | undefined

    /**
     * Return the count of items in the response. Be careful with this. On a big catalog,
     * it can decrease performance in a significant way
     */
    with_count?: boolean | undefined
  }
}

export interface GetListOfAttributesParams extends CommonRequestOptions {
  /** Whether the `_links.next.href` should be followed until all pages are loaded */
  fetchAll?: boolean | undefined

  params?: {
    /**
     * Filter products, for more details see https://api.akeneo.com/documentation/filter.html#filter-attributes
     */
    search?: string | undefined

    /**
     * Number of the page to retrieve
     * Should never be set manually, see https://api.akeneo.com/documentation/pagination.html
     */
    page?: number | undefined

    /**
     * Number of results by page, see https://api.akeneo.com/documentation/pagination.html
     */
    limit?: number | undefined

    /**
     * Return the count of items in the response. Be careful with this. On a big catalog,
     * it can decrease performance in a significant way
     */
    with_count?: boolean | undefined
  }
}

export interface GetListOfReferenceEntitiesParams extends CommonRequestOptions {
  /** Whether the `_links.next.href` should be followed until all pages are loaded */
  fetchAll?: boolean | undefined

  params?: {
    /**
     * Filter products, for more details see https://api.akeneo.com/documentation/filter.html#filter-attributes
     */
    search_after?: string | undefined
  }
}

export interface GetListOfReferenceEntityRecordsParams extends CommonRequestOptions {
  /** Whether the `_links.next.href` should be followed until all pages are loaded */
  fetchAll?: boolean | undefined

  /** Code of the reference entity for which you want the records */
  referenceEntityCode: string

  params?: {
    /**
     * Filter records of the reference entity, for more details see the Filters section:
     * https://api.akeneo.com/documentation/filter.html#filter-reference-entity-records
     */
    search?: string | undefined

    /**
     * Filter attribute values to return scopable attributes for the given channel as
     * well as the non localizable/non scopable attributes, for more details see the
     * Filter attribute values by channel section:
     * https://api.akeneo.com/documentation/filter.html#record-values-by-channel
     */
    channel?: string | undefined

    /**
     * Filter attribute values to return localizable attributes for the given locales
     * as well as the non localizable/non scopable attributes, for more details see
     * the Filter attribute values by locale section:
     * https://api.akeneo.com/documentation/filter.html#record-values-by-locale
     */
    locales?: string | undefined

    /**
     * Cursor to the first page by default -  when using the `search_after` pagination
     * method type. Should never be set manually, see Pagination section:
     * https://api.akeneo.com/documentation/pagination.html
     */
    search_after?: string | undefined
  }
}
