/**
 * Represents an application setting with its configuration and metadata.
 */
type Setting = {
  /** The unique identifier for the setting */
  key: string,
  /** A brief description of what the setting does */
  description: string,
  /** Additional comments or notes about the setting */
  comments: string,
  /** The current value of the setting */
  value: string | number | Date | boolean | string[],
  /** The expected data type of the setting's value */
  dataType: 'string'| 'string-array'| 'integer'| 'boolean'| 'date'
}
