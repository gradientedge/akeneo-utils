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

/**
 * The product model definition
 * Visible in the response body here: https://api.akeneo.com/api-reference.html#get_product_models__code_
 */
export interface ProductModel {
  /** Product model code */
  code: string
  /** Family code from which the product inherits its attributes and attributes requirements (since the 3.2) */
  family: string
  /** Family variant code from which the product model inherits its attributes and variant attributes */
  family_variant: string
  /** Code of the parent product model. This parent can be modified since the 2.3. */
  parent: string
  /** Codes of the categories in which the product model is categorized */
  categories: string[]
  values: {
    attributeCode: {
      /** Channel code of the product value */
      scope: string
      /** Locale code of the product value */
      locale: string
      /** Product value */
      data: any
    }[]
  }
  associations: {
    associationTypeCode: {
      /** Array of groups codes with which the product is in relation */
      groups: string[]
      /** Array of product identifiers with which the product is in relation */
      products: string[]
      /** Array of product model codes with which the product is in relation (only available since the v2.1) */
      product_models: string[]
    }
  }
  quantified_associations: {
    quantifiedAssociationTypeCode: {
      /** Array of objects containing product identifiers and quantities with which the product model is in relation */
      products: any[]
      /** Array of objects containing product model codes and quantities with which the product model is in relation */
      product_models: any[]
    }
  }
  /** Date of creation */
  created: string
  /** Date of the last update */
  updated: string
  metadata: {
    /** Status of the product model regarding the user permissions */
    workflow_status: string
  }
  /** Product model quality scores for each channel/locale combination (only available on SaaS platforms and when the "with_quality_scores" query parameter is set to "true") */
  quality_scores: any
}

/**
 * The product definition
 * Visible in the response body here: https://api.akeneo.com/api-reference.html#get_products__code_
 */
export interface Product {
  /** Product identifier, i.e. the value of the only `pim_catalog_identifier` attribute */
  identifier: string

  /** Whether the product is enabled */
  enabled: boolean

  /** Family code from which the product inherits its attributes and attributes requirements. */
  family: string

  /** Codes of the categories in which the product is classified */
  categories: string[]

  /** Codes of the groups to which the product belong */
  groups: string[]

  /** Code of the parent product model when the product is a variant (only available since the 2.0). This parent can be modified since the 2.3. */
  parent: string

  values: {
    attributeCode: {
      /** Channel code of the product value */
      scope: string
      /** Locale code of the product value */
      locale: string
      /** Product value. See the `data` format section for more details. */
      data: any
      /** Object containing labels of attribute options (only available since the 5.0 and when query parameter "with_attribute_options" is set to "true"). See the `linked_data` format section for more details. */
      linked_data: any
    }[]
  }

  associations: {
    associationTypeCode: {
      /** Array of groups codes with which the product is in relation */
      groups: string[]
      /** Array of product identifiers with which the product is in relation */
      products: string[]
      /** Array of product model codes with which the product is in relation (only available since the v2.1) */
      product_models: string[]
    }
  }

  quantified_associations: {
    quantifiedAssociationTypeCode: {
      /** Array of objects containing product identifiers and quantities with which the product is in relation */
      products: any[]
      /** Array of objects containing product model codes and quantities with which the product is in relation */
      product_models: any[]
    }
  }

  /** Date of creation */
  created: string

  /** Date of the last update */
  updated: string

  metadata: {
    /** Status of the product regarding the user permissions */
    workflow_status: string
  }

  /** Product quality scores for each channel/locale combination (only available since the 5.0 and when the "with_quality_scores" query parameter is set to "true") */
  quality_scores: any

  /** Product completenesses for each channel/locale combination (only available on SaaS platforms, and when the "with_completenesses" query parameter is set to "true") */
  completenesses: any
}

export interface AttributeOption {
  /** Code of option */
  code: string

  /** Code of attribute related to the attribute option */
  attribute: string

  /** Order of attribute option */
  sort_order: number

  /** Locale/string pairs, e.g. { en_GB: 'Some English text' } */
  labels: Record<string, string>
}

/**
 * Interface for the generic results container
 */
export interface Results<T = any> {
  _links: {
    self?: {
      /** URI of the current page of resources */
      href: string
    }
    first?: {
      /** URI of the first page of resources */
      href: string
    }
    previous?: {
      /** URI of the previous page of resources */
      href: string
    }
    next?: {
      /** URI of the next page of resources */
      href: string
    }
  }

  /** Current page number (only available when the 'pagination_type' query string parameter is either undefined or set to 'page' */
  current_page?: number

  /** Total number of items (only available if the 'with_count' query string parameter is used in the query) */
  items_count?: number

  _embedded: {
    items: (T & {
      _links: {
        self: {
          /** URI of the resource */
          href: string
        }
      }
    })[]
  }
}
