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
 *  Receives student data from the server 
 */
export const parseStudents = (students: Student[]) => {
  console.log('students', students);
  return Array.isArray(students) ? students : [];
}

export const parseStudentDataList = (students: Student[]) => {
  if (!Array.isArray(students)) return [];
  return students.map(student => `${student.lastname}, ${student.firstname} <${student.email}>`);
};

export const parseStudentNames = parseStudentDataList;

/**
 *  parses daily schedule data from the server 
 * */
export const parseDailyBlocks = (block: string): DailyBlock[] => {
  const parsedRawBlocks: RawDailyBlock[] = safeJsonParse(block, []);
  const dailyBlocks: DailyBlock[] = hydrateDailyBlock(parsedRawBlocks); 

  return dailyBlocks;
}

/**
 *  parses teacher intervention data from the server 
 * */
export const parseInterventionTeachers = (schedulesJson: string) => {
  // graceful fallback; if the intervention schedule can't be found, 
  // use an input box instead of a select box
  return safeJsonParse(schedulesJson, []);
}

/**
 *  parses no fly from the server 
 * */
export const parseNoFlyList = (emails: string[]) => {
  return Array.isArray(emails) ? emails : [];
}

/**
 *  parses max signups from the server 
 * */
export const parseMaxSignups = (maxValue: string) => {
  try {
    const parsed = Number(maxValue);
    return Number.isNaN(parsed) || parsed === 0 ? 10 : parsed;
  } catch (error) {
    return 10;
  }
}

/**
 *  parses signup data from the server 
 * */
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
 *  parses teacher intervention data from the server 
 * */
export const parseStudyTeachers = (studyTeachersJson: string) => {
  return safeJsonParse(studyTeachersJson, []);
}

/**
 *  parses signup data from the server (if updating instead of creating new) 
 * */
export const parseUpdateStudent = (signupJson: string) => {
  return safeJsonParse(signupJson, []);
}

/**
 *  parses settings from the server (if updating instead of creating new) 
 * */
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

function hydrateDailyBlock(rawData: RawDailyBlock[]): DailyBlock[] {
  return rawData.map((block: any) => ({
    ...block,
    date: new Date(block.date),
    period: String(block.period),
  }));
}

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

