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
export const parseSignups = (signups: string): Signup[] => {
  const rawData =  safeJsonParse(signups, []) as RawSignup[];
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
    const settingsDBRows: string[] = safeJsonParse(settingsJson, []);
    settingsDBRows.forEach(row => {
      if (row && Array.isArray(row) && row.length === 5) {
        settings.push({
          key: row[0],
          value: row[1],
          description: row[2],
          comments: row[3],
          dataType: row[4],
        });
      }
    });
  } catch (error) {
    return [];
  }
  return hydrateSettings(settings);

}

function hydrateDailyBlock(rawData: RawDailyBlock[]): DailyBlock[] {
  return rawData.map((block: any) => ({
    ...block,
    date: new Date(block.date),
  }));
}

function hydrateSignups(rawData: RawSignup[]): Signup[] {
  return rawData.map((block: any) => ({
    ...block,
    date: new Date(block.date),
    timestamp: new Date(block.timestamp),
  }));
}

function hydrateSettings(rawSettings: Setting[]): Setting[] {
  return rawSettings.map(setting => {
    // stringified values sent by the server must be strings
    if (typeof setting.value !=="string") return setting;

    switch (setting.dataType) {
      case 'boolean':
        return { ...setting, value: setting.value === 'true' || setting.value === "On"} as Setting;
      case 'integer':
        return { ...setting, value: parseInt(setting.value)} as Setting;
      case 'date':
        return { ...setting, value: new Date(setting.value)} as Setting;
      case 'string-array':
        return { ...setting, value: setting.value.split(',').map(s => s.trim()) } as Setting;
      case 'string': 
      default:
        return setting;
    }
  });
}

