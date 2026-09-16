export interface Setting {
  key: string,
  description: string,
  comments: string,
  value: string | number | Date | boolean,
}