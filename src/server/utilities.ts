
/** 
 * Determines if two Date object are the same date, regardless of time-of-day
 */
const isSameDate = (date1: Date, date2: Date) => {
  const monthMatch: boolean = date1.getMonth() === date2.getMonth();
  const yearMatch: boolean = date1.getFullYear() === date2.getFullYear();
  const dateMatch: boolean = date1.getDate() === date2.getDate();

  return monthMatch && yearMatch && dateMatch;
}

function getActiveDateWindow(weeksPast: number = 2, weeksFuture: number = 2): { start: Date; end: Date } {
  const now = new Date();
  
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (weeksPast * 7), 0, 0, 0, 0);
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + (weeksFuture * 7), 23, 59, 59, 999);
  
  return { start, end };
}


/**
 * Formats a Date into MM/DD/YYYY
 */
 function formatDateSlashes(date: Date) {
  return (date.getMonth()+1) +"/" + date.getDate() + "/" + date.getFullYear();
}

/**
 * Returns the URL to the script/webpage
 */
function getScriptUrl() {
  return ScriptApp.getService().getUrl();
}

/**
 * Returns the email address of the currently signin user. 
 * Note: user must be signed into Chrome, and this only works for users within the domain 
 */
function getEmail() {
  if (!email) email = Session.getActiveUser().getEmail();
  return email;
}

const safeJsonParse = (data: string, fallback = []) => {
  if (data === null || data === undefined) return fallback;
  if (typeof data !== 'string') return data;
  try {
    return JSON.parse(data) || fallback;
  } catch (error) {
    console.error("Failed to parse JSON string:", error);
    return fallback;
  }
};

function hydrateSignup(rawData: RawSignup): Signup {
  return {
    ...rawData,
    date: new Date(rawData.date),
    timestamp: new Date(rawData.timestamp),
    period: String(rawData.period),
  };
}