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
  if (Number.isNaN(year) || Number.isNaN(month) || Number.isNaN(day)) {
    throw new Error("Invalid date format");
  }
  return new Date(year, month - 1, day);
}

 /**
  * Formats a Date into MM/DD/YYYY
  * 
  * @param {Date} date The date to format
  * @return {string} The formatted string
  */
export const formatDateSlashes = (date) => {
  const month = date.getMonth() + 1 ;
  const day = date.getDate() ;
  const year = date.getFullYear(); 

  return month +"/" + day + "/" + year;
 }

 
export const isValidTime12Hr = (timeStr) => {
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

export const isValidTime24Hr = (timeStr) => {
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
 * Helper function to format a Time as HH:MM AM/PM 
 * 
 * @param {Date} date The Datetime to format
 * @return {string} The formatted time
 * */
export const formatTime = (date) => {
  try {
    if (isValidTime12Hr(date)) {
      return date;
    }
    if (!(date instanceof Date)) {
      date = new Date(date);
    }
    
    let hours = date.getHours();
    let minutes = date.getMinutes();
    let ampm = "AM";

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
    
    if (minutes < 10) {
      minutes = "0" + minutes
    }
    
    return `${hours}:${minutes} ${ampm}`;
  } catch (error) {
    return "12:00 am";
  }
}

export const convert24HrTo12Hr = (time24Str) => {
  const [hoursStr, minutesStr] = time24Str.split(':');
  let hours = parseInt(hoursStr, 10);
  // Determine AM or PM
  const period = hours >= 12 ? 'PM' : 'AM';
  
  // Convert 0 (midnight) and 12 (noon) to 12, otherwise use modulo 12
  hours = hours % 12 || 12;
  const minutesStr2 = minutesStr.length < 2 ? "0" + minutesStr : minutesStr ;
  
  return `${hours}:${minutesStr2} ${period}`;
};


export const chooseSemester = (currentDate, rolloverDate) => {
  if (!(currentDate instanceof Date) || !(rolloverDate instanceof Date)) {
    return null;
  }
  if (currentDate.getTime() >= rolloverDate.getTime()) {
    return '2';
  } else {
    return '1';
  }
}
