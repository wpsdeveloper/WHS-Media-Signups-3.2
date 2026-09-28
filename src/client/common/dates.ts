/**
 * @file dates.ts
 * @description Provides date and time formatting, parsing, comparison, and semester selection utilities.
 */

export const month: string[] = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export const weekday: string[] = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/**
 * Formats a Date object into a YYYY-MM-DD string suitable for HTML date inputs.
 * 
 * @param date - The Date object to format.
 * @returns The formatted date string (YYYY-MM-DD).
 * @throws Error if date is invalid.
 */
export const toDateInputValue = (date: Date):string => {
  try {
    const year: string = String(date.getFullYear());
    const month: string = String(date.getMonth() + 1).padStart(2, "0");
    const day: string = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  } catch (error) {
    throw new Error("Invalid date parameter");
  }
}

/** 
 * Determines if two Date objects are the same date, regardless of time-of-day.
 * 
 * @param date1 - The first date to compare.
 * @param date2 - The second date to compare.
 * @returns True if the two dates represent the same calendar day.
 */
export const isSameDate = (date1: Date, date2: Date) => {
  const monthMatch: boolean = date1.getMonth() === date2.getMonth();
  const yearMatch: boolean = date1.getFullYear() === date2.getFullYear();
  const dateMatch: boolean = date1.getDate() === date2.getDate();

  return monthMatch && yearMatch && dateMatch;
}

/**
 * Parses a YYYY-MM-DD string into a Date object.
 * 
 * @param value - The date string in YYYY-MM-DD format.
 * @returns The parsed Date object.
 * @throws Error if value is missing or formatted incorrectly.
 */
export function parseDateInput(value: string): Date {
  if (!value) throw new Error("Missing parameter");
  
  const [year, month, day]: number[] = value.split("-").map(Number);
  if (Number.isNaN(year) || Number.isNaN(month) || Number.isNaN(day)) {
    throw new Error("Invalid date format");
  }
  return new Date(year, month - 1, day);
}

 /**
  * Formats a Date into MM/DD/YYYY string representation.
  * 
  * @param date - The Date to format.
  * @returns The formatted date string (MM/DD/YYYY).
  */
export const formatDateSlashes = (date: Date): string => {
  const month: number = date.getMonth() + 1 ;
  const day: number = date.getDate() ;
  const year:number = date.getFullYear(); 

  return month +"/" + day + "/" + year;
 }

 
/**
 * Validates whether a string is a valid 12-hour time format (e.g., "10:30 AM").
 * 
 * @param timeStr - The time string to validate.
 * @returns True if valid 12-hour time, false otherwise.
 */
export const isValidTime12Hr = (timeStr: string): boolean => {
  // Regex Breakdown:
  // ^              : Start of the string
  // (1[0-2]|0?[1-9]) : Hours 1-12 (allows optional leading zero for 1-9)
  // :              : Literal colon
  // [0-5][0-9]     : Minutes 00-59
  // \s?            : Optional space (common in user input)
  // (am|pm)        : The meridian (case-insensitive via 'i' flag)
  // $              : End of the string
  
  const regex = /^(1[0-2]|0?[1-9]):[0-5][0-9]\s?(am|pm|AM|PM)$/i;
  return regex.test(timeStr);

}

/**
 * Validates whether a string is a valid 24-hour time format (e.g., "14:30").
 * 
 * @param timeStr - The time string to validate.
 * @returns True if valid 24-hour time, false otherwise.
 */
export const isValidTime24Hr = (timeStr: string): boolean => {
  // Regex Breakdown:
  // ^                  : Start of the string
  // ([01]?[0-9]|2[0-3]): Hours 00-23 (allows optional leading zero for 0-9)
  // :                  : Literal colon
  // [0-5][0-9]         : Minutes 00-59
  // $                  : End of the string
  
  const regex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return regex.test(timeStr);
};

/**
 * Formats a Date or time value as HH:MM AM/PM.
 * 
 * @param date - The Date object or timestamp to format.
 * @returns The formatted 12-hour time string.
 */
export const formatTime = (date: Date): string => {
  try {
    if (!(date instanceof Date)) {
      date = new Date(date);
    }
    
    let hours: number = date.getHours();
    let minutes: number = date.getMinutes();
    let ampm: string = "AM";

    if (Number.isNaN(hours) || Number.isNaN(minutes)) {
      throw new Error("Invalid time");
    }
    
    if (hours >= 12) {
      ampm = "PM";
    }
    if (hours > 12) {
      hours = hours - 12;
    }
    if (hours === 0) {
      hours = 12;
    }
    let minuteString = (minutes < 10) ? ("0" + minutes): String(minutes);
    
    return `${hours}:${minuteString} ${ampm}`;
  } catch (error) {
    return "12:00 am";
  }
}

/**
 * Converts a 24-hour time string (HH:MM) to 12-hour AM/PM format.
 * 
 * @param time24Str - The 24-hour time string.
 * @returns The converted 12-hour time string.
 */
export const convert24HrTo12Hr = (time24Str: string): string => {
  const [hoursStr, minutesStr] = time24Str.split(':');
  let hours: number = parseInt(hoursStr, 10);
  // Determine AM or PM
  const period: string = hours >= 12 ? 'PM' : 'AM';
  
  // Convert 0 (midnight) and 12 (noon) to 12, otherwise use modulo 12
  hours = hours % 12 || 12;
  const minutesStr2 = minutesStr.length < 2 ? "0" + minutesStr : minutesStr ;
  
  return `${hours}:${minutesStr2} ${period}`;
};


/**
 * Determines the academic semester ("1" or "2") based on current date and rollover date.
 * 
 * @param currentDate - The current date.
 * @param rolloverDate - The semester rollover date.
 * @returns "2" if current date is on or after rollover date, otherwise "1".
 */
export const chooseSemester = (currentDate: Date, rolloverDate: Date): string => {
  if (!(currentDate instanceof Date) || !(rolloverDate instanceof Date)) {
    return '0';
  }
  if (currentDate.getTime() >= rolloverDate.getTime()) {
    return '2';
  } else {
    return '1';
  }
}
