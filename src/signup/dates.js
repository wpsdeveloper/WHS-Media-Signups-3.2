export const toDateInputValue = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** 
 * Determines if two Date object are the same date, regardless of time-of-day
 * 
 * @param {Date} date1 The first date to compare
 * @param {Date} date2 The second date to compare
 * @return {boolean} True if the two dates are the same
 */
export const isSameDate = (date1, date2) => {
  const monthMatch = date1.getMonth() === date2.getMonth();
  const yearMatch = date1.getFullYear() === date2.getFullYear();
  const dateMatch = date1.getDate() === date2.getDate();

  return monthMatch && yearMatch && dateMatch;
}

export function parseDateInput(value) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

 /**
  * Formats a Date into MM/DD/YYYY
  * 
  * @param {Date} date The date to format
  * @return {string} The formatted string
  */
 export const formatDateSlashes = (date) => {
   return (date.getMonth()+1) +"/" + date.getDate() + "/" + date.getFullYear();
 }