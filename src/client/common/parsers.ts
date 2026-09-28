import * as dates from '../common/dates';
import { getAppConfig } from "./app-config";

/**
 * Safe JSON parsing helper to prevent syntax crashes on corrupt or missing strings.
 */
export const safeJsonParse = (data: string, fallback = []) => {
  if (data === null || data === undefined) return fallback;
  if (typeof data !== 'string') return data;
  try {
    return JSON.parse(data) || fallback;
  } catch (error) {
    console.error("Failed to parse JSON string:", error);
    return fallback;
  }
};

/**
 * Receives student data from the server and ensures it's an array.
 * @param students The raw student data array.
 * @returns The parsed student data array, or an empty array if invalid.
 */
export const parseStudents = (students: Student[]) => {
  return Array.isArray(students) ? students : [];
}

/**
 * Parses a list of students into an array of formatted name and email strings.
 * @param students The array of student objects.
 * @returns An array of formatted strings (e.g. "Lastname, Firstname <email>").
 */
export const parseStudentDataList = (students: Student[]) => {
  if (!Array.isArray(students)) return [];
  return students.map(student => `${student.lastname}, ${student.firstname} <${student.email}>`);
};

/** Alias for parseStudentDataList */
export const parseStudentNames = parseStudentDataList;

/**
 * Parses daily schedule block data from the server.
 * @param block The JSON string representing daily block data.
 * @returns An array of hydrated DailyBlock objects.
 */
export const parseDailyBlocks = (block: string): DailyBlock[] => {
  const parsedRawBlocks: RawDailyBlock[] = safeJsonParse(block, []);
  const dailyBlocks: DailyBlock[] = hydrateDailyBlock(parsedRawBlocks); 

  return dailyBlocks;
}

/**
 * Parses teacher intervention data from the server.
 * @param schedulesJson The JSON string representing intervention teachers.
 * @returns An array of intervention teachers.
 */
export const parseInterventionTeachers = (schedulesJson: string) => {
  // graceful fallback; if the intervention schedule can't be found, 
  // use an input box instead of a select box
  return safeJsonParse(schedulesJson, []);
}

/**
 * Parses no fly list data from the server.
 * @param emails An array of emails.
 * @returns The array of emails, or an empty array if invalid.
 */
export const parseNoFlyList = (emails: string[]) => {
  return Array.isArray(emails) ? emails : [];
}

/**
 * Parses the maximum number of signups allowed.
 * @param maxValue The raw string value representing the maximum.
 * @returns The parsed maximum value as a number, defaulting to 10.
 */
export const parseMaxSignups = (maxValue: string) => {
  try {
    const parsed = Number(maxValue);
    return Number.isNaN(parsed) || parsed === 0 ? 10 : parsed;
  } catch (error) {
    return 10;
  }
}

/**
 * Parses signup data from the server.
 * @param signups The raw signup data, either as a JSON string or object/array.
 * @returns An array of hydrated Signup objects.
 */
export const parseSignups = (signups: any): Signup[] => {
  let rawData: RawSignup[] = [];
  if (typeof signups === 'string') {
    const parsed = safeJsonParse(signups, []);
    rawData = Array.isArray(parsed) ? parsed : (parsed?.signups || []);
  } else if (Array.isArray(signups)) {
    rawData = signups;
  } else if (signups && typeof signups === 'object' && Array.isArray(signups.signups)) {
    rawData = signups.signups;
  }
  return hydrateSignups(rawData);
}

/**
 * Parses study teachers data from the server.
 * @param studyTeachersJson The JSON string representing study teachers.
 * @returns An array of study teachers.
 */
export const parseStudyTeachers = (studyTeachersJson: string) => {
  return safeJsonParse(studyTeachersJson, []);
}

/**
 * Parses student data for updates from the server.
 * @param signupJson The JSON string representing student update data.
 * @returns An array of parsed update data.
 */
export const parseUpdateStudent = (signupJson: string) => {
  return safeJsonParse(signupJson, []);
}

/**
 * Parses settings from the server.
 * @param settingsJson The JSON string representing settings.
 * @returns An array of hydrated Setting objects.
 */
export const parseSettings = (settingsJson: string) => {
  const settings: Setting[] = [];
  try {
    const settingsDBRows: any[] = safeJsonParse(settingsJson, []);
    settingsDBRows.forEach(row => {
      if (!row) return;
      if (Array.isArray(row) && row.length >= 5) {
        settings.push({
          key: row[0],
          value: row[1],
          description: row[2],
          comments: row[3],
          dataType: row[4],
        });
      } else if (typeof row === 'object' && row.key !== undefined) {
        settings.push({
          key: row.key,
          value: row.value,
          description: row.description,
          comments: row.comments,
          dataType: row.dataType,
        });
      }
    });
  } catch (error) {
    console.error("Failed to parse settings:", error);
    return [];
  }
  return hydrateSettings(settings);

}

/**
 * Normalizes a time string or Date object into a consistent format.
 * Converts 24-hr and ISO strings to 12-hr format.
 * @param val The time string or Date to normalize.
 * @returns The normalized time string.
 */
export const normalizeTimeString = (val: any): string => {
  if (val === undefined || val === null) return "";
  if (typeof val !== "string") {
    if (val instanceof Date) return dates.formatTime(val);
    val = String(val);
  }
  const trimmed = val.trim();
  if (!trimmed) return "";
  
  // If already 12-hr format like "10:30 AM"
  if (dates.isValidTime12Hr(trimmed)) {
    return trimmed;
  }
  
  // If 24-hr format like "10:30"
  if (dates.isValidTime24Hr(trimmed)) {
    return dates.convert24HrTo12Hr(trimmed);
  }
  
  // If ISO date string like "1899-12-30T15:30:00.000Z"
  const parsedDate = new Date(trimmed);
  if (!isNaN(parsedDate.getTime()) && (trimmed.includes('T') || trimmed.includes('-'))) {
    return dates.formatTime(parsedDate);
  }
  
  return trimmed;
};

/**
 * Hydrates raw daily block data by converting string dates and periods.
 * @param rawData The raw daily block array.
 * @returns An array of DailyBlock objects with properly typed date and period.
 */
function hydrateDailyBlock(rawData: RawDailyBlock[]): DailyBlock[] {
  return rawData.map((block: any) => ({
    ...block,
    date: new Date(block.date),
    period: String(block.period),
  }));
}

/**
 * Hydrates raw signup data by normalizing times and converting dates.
 * @param rawData The raw signup array.
 * @returns An array of Signup objects with properly formatted fields.
 */
function hydrateSignups(rawData: RawSignup[]): Signup[] {
  return rawData.map((block: any) => ({
    ...block,
    date: new Date(block.date),
    timestamp: new Date(block.timestamp),
    period: String(block.period),
    studyIn1: normalizeTimeString(block.studyIn1),
    mediaIn: normalizeTimeString(block.mediaIn),
    mediaOut: normalizeTimeString(block.mediaOut),
    studyIn2: normalizeTimeString(block.studyIn2),
  }));
}

/**
 * Hydrates settings based on their data type.
 * @param rawSettings The raw settings array.
 * @returns An array of hydrated Setting objects with their values casted to the correct types.
 */
function hydrateSettings(rawSettings: Setting[]): Setting[] {
  return rawSettings.map(setting => {
    const dataType = setting.dataType || (setting as any).type;
    switch (dataType) {
      case 'boolean': {
        const strVal = String(setting.value).trim().toLowerCase();
        const isOn = strVal === 'on' || strVal === 'true' || setting.value === true;
        return { ...setting, value: isOn ? "On" : "Off" } as Setting;
      }
      case 'integer':
        return { ...setting, value: typeof setting.value === 'number' ? setting.value : parseInt(String(setting.value)) } as Setting;
      case 'date':
        return { ...setting, value: setting.value instanceof Date ? setting.value : new Date(String(setting.value)) } as Setting;
      case 'string-array':
        return { ...setting, value: Array.isArray(setting.value) ? setting.value : String(setting.value).split(',').map(s => s.trim()) } as Setting;
      case 'string': 
      default:
        return setting;
    }
  });
}

