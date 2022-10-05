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

export type ChannelCode = string
export type Locale = string

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
  values: AttributeValues

  associations: Record<
    string,
    {
      /** Array of groups codes with which the product is in relation */
      groups: string[]
      /** Array of product identifiers with which the product is in relation */
      products: string[]
      /** Array of product model codes with which the product is in relation (only available since the v2.1) */
      product_models: string[]
    }
  >

  quantified_associations: Record<
    string,
    {
      /** Array of objects containing product identifiers and quantities with which the product model is in relation */
      products: any[]
      /** Array of objects containing product model codes and quantities with which the product model is in relation */
      product_models: any[]
    }
  >

  /** Date of creation */
  created: string
  /** Date of the last update */
  updated: string
  metadata: {
    /** Status of the product model regarding the user permissions */
    workflow_status: string
  }
  /**
   * Product model quality scores for each channel/locale combination
   * (only available on SaaS platforms and when the "with_quality_scores"
   * query parameter is set to "true")
   */
  quality_scores?: {
    scope: ChannelCode | null
    locale: Locale | null
    data: string
  }[]
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

  values: AttributeValues

  associations: Record<
    string,
    {
      /** Array of groups codes with which the product is in relation */
      groups: string[]
      /** Array of product identifiers with which the product is in relation */
      products: string[]
      /** Array of product model codes with which the product is in relation (only available since the v2.1) */
      product_models: string[]
    }
  >

  quantified_associations: Record<
    string,
    {
      /** Array of objects containing product identifiers and quantities with which the product is in relation */
      products: any[]
      /** Array of objects containing product model codes and quantities with which the product is in relation */
      product_models: any[]
    }
  >

  /** Date of creation */
  created: string

  /** Date of the last update */
  updated: string

  metadata: {
    /** Status of the product regarding the user permissions */
    workflow_status: string
  }

  /** Product quality scores for each channel/locale combination (only available since the 5.0 and when the "with_quality_scores" query parameter is set to "true") */
  quality_scores?: {
    scope: ChannelCode | null
    locale: Locale | null
    data: string
  }[]

  /** Product completenesses for each channel/locale combination (only available on SaaS platforms, and when the "with_completenesses" query parameter is set to "true") */
  completenesses?: {
    scope: ChannelCode | null
    locale: Locale | null
    data: number
  }[]
}

/**
 * The family definition
 * Visible in the response body here: https://api.akeneo.com/api-reference.html#get_families
 */
export interface Family {
  _links: {
    self?: {
      /** URI of the current resources */
      href: string
    }
  }

  /** Family code */
  code: string

  /** Attribute code used as label */
  attribute_as_label: string

  /** Attribute code used as the main picture in the user interface (only since v2.0) */
  attribute_as_image: string | null

  /** Attributes codes that compose the family */
  attributes: string[]

  /**
   * Attributes codes of the family that are required for the completeness
   * calculation for the channel `channelCode`
   */
  attribute_requirements: Record<ChannelCode, string[]>

  /** Locale/string pairs, e.g. { en_GB: 'Some English text' } */
  labels: Record<Locale, string>
}

/**
 * The family definition
 * Visible in the response body here:
 * https://api.akeneo.com/api-reference.html#get_families__family_code__variants__code__
 */
export interface FamilyVariant {
  /** Family code */
  code: string

  /** Attribute set definitions */
  variant_attribute_sets: {
    /** Enrichment level */
    level: number
    /** Codes of attributes used as variant axes */
    axes: string[]
    /** Codes of attributes bind to this enrichment level */
    attributes: string[]
  }[]

  /**
   * Attributes codes of the family that are required for the completeness
   * calculation for the channel `channelCode`
   */
  attribute_requirements: Record<ChannelCode, string[]>

  /** Locale/string pairs, e.g. { en_GB: 'Some English text' } */
  labels: Record<Locale, string>
}

export interface AttributeOption {
  /** Code of option */
  code: string

  /** Code of attribute related to the attribute option */
  attribute: string

  /** Order of attribute option */
  sort_order: number

  /** Locale/string pairs, e.g. { en_GB: 'Some English text' } */
  labels: Record<Locale, string>
}

export interface Attribute {
  /** Attribute code */
  code: string

  /** Attribute type. See type section for more details. */
  type: string

  /** Attribute label by locale */
  labels: Record<Locale, string>

  /** Attribute group */
  group: string

  /** Group label by locale */
  group_labels: Record<Locale, string>

  /** Order of the attribute in its group */
  sort_order: number

  /** Whether the attribute is localizable, i.e. can have one value by locale */
  localizable: boolean

  /** Whether the attribute is scopable, i.e. can have one value by channel */
  scopable: boolean

  /** To make the attribute locale specific, specify here for which locales it is specific */
  available_locales: Locale[]

  /** Whether two values for the attribute cannot be the same */
  unique: boolean

  /** Whether the attribute can be used as a filter for the product grid in the PIM user interface */
  useable_as_grid_filter: boolean

  /** Number maximum of characters allowed for the value of the attribute when the attribute type is `pim_catalog_text`, `pim_catalog_textarea` or `pim_catalog_identifier` */
  max_characters?: number | undefined

  /** Validation rule type used to validate any attribute value when the attribute type is `pim_catalog_text` or `pim_catalog_identifier` */
  validation_rule?: string | undefined

  /** Regexp expression used to validate any attribute value when the attribute type is `pim_catalog_text` or `pim_catalog_identifier` */
  validation_regexp?: string | undefined

  /** Whether the WYSIWYG interface is shown when the attribute type is `pim_catalog_textarea` */
  wysiwyg_enabled?: boolean | undefined

  /** Minimum integer value allowed when the attribute type is `pim_catalog_metric`, `pim_catalog_price` or `pim_catalog_number` */
  number_min?: string | undefined

  /** Maximum integer value allowed when the attribute type is `pim_catalog_metric`, `pim_catalog_price` or `pim_catalog_number` */
  number_max?: string | undefined

  /** Whether decimals are allowed when the attribute type is `pim_catalog_metric`, `pim_catalog_price` or `pim_catalog_number` */
  decimals_allowed?: boolean | undefined

  /** Whether negative values are allowed when the attribute type is `pim_catalog_metric` or `pim_catalog_number` */
  negative_allowed?: boolean | undefined

  /** Metric family when the attribute type is `pim_catalog_metric` */
  metric_family?: string | undefined

  /** Default metric unit when the attribute type is `pim_catalog_metric` */
  default_metric_unit?: string | undefined

  /** Minimum date allowed when the attribute type is `pim_catalog_date` */
  date_min?: string | undefined

  /** Maximum date allowed when the attribute type is `pim_catalog_date` */
  date_max?: string | undefined

  /** Extensions allowed when the attribute type is `pim_catalog_file` or `pim_catalog_image` */
  allowed_extensions?: string[] | undefined

  /** Max file size in MB when the attribute type is `pim_catalog_file` or `pim_catalog_image` */
  max_file_size?: string | undefined

  /** Reference entity code when the attribute type is `akeneo_reference_entity` or `akeneo_reference_entity_collection` OR Asset family code when the attribute type is `pim_catalog_asset_collection` */
  reference_data_name?: string | undefined

  /** Default value for a Yes/No attribute, applied when creating a new product or product model (only available since the 5.0) */
  default_value?: boolean | undefined

  /** Configuration of the Table attribute (columns) */
  table_configuration: any[]
}

export interface ReferenceEntity {
  /** Reference entity code */
  code: string

  /** Locale/string pairs, e.g. { en_GB: 'Some English text' } */
  labels: Record<Locale, string>

  image?: string | undefined
}

export interface ReferenceEntityRecord {
  _links: {
    image_download: {
      /** URI to download the binaries of the reference entity image file */
      href: string
    }
  }

  /** Reference entity code */
  code: string

  /** Locale/string pairs, e.g. { en_GB: 'Some English text' } */
  labels: Record<Locale, string>

  /** Code of the reference entity image */
  image?: string | undefined
}

export interface AttributeValueItem {
  /** Channel code of the product value */
  scope: ChannelCode | null

  /** Locale code of the product value */
  locale: Locale | null

  /** Product value */
  data: any

  /**
   * Object containing labels of attribute options (only available since the 5.0 and
   * when query parameter "with_attribute_options" is set to "true"). See the `linked_data`
   * format section for more details:
   * https://api.akeneo.com/concepts/products.html#the-linked_data-format
   */
  linked_data: any
}

export type AttributeValue = AttributeValueItem[]

export type AttributeValues = Record<string, AttributeValue>

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
