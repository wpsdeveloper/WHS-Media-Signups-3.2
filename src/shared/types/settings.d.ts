type Setting = {
  key: string,
  description: string,
  comments: string,
  value: string | number | Date | boolean | string[],
  dataType: 'string'| 'string-array'| 'integer'| 'boolean'| 'date'
}
