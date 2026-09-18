import { Student } from "../../shared/types/students";
import { Setting } from "../../shared/types/settings";
import * as dates from '../common/dates';
import { getAppConfig } from "./appConfig";

/**
 * Safe JSON parsing helper to prevent syntax crashes on corrupt or missing strings.
 */
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

/**
 *  Receives student data from the server 
 */
export const parseStudents = (students: Student[]) => {
  return Array.isArray(students) ? students : [];
}

export const parseStudentNames = (students: Student[]) => {
  if (!Array.isArray(students)) return [];
  return students.map(student => `${student.lastname}, ${student.firstname} <${student.email}>`);
};

/**
 *  parses daily schedule data from the server 
 * */
export const parseDailyBlocks = (schedules: string): DailyBlock[] => {
  const parsedSchedules = safeJsonParse(schedules, []);
  return flattenDailyBlocks(parsedSchedules);
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
export const parseSignups = (signups: string) => {
  return safeJsonParse(signups, []);
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
  return settings;

}

const flattenDailyBlocks = (rawData: RawDailyBlock[]): DailyBlock[] => {
  const schedules: DailyBlock[] = [];
  const s2date = new Date(getAppConfig().s2Date);

  for (const rawDay of rawData) {
    const parsedDate = new Date(rawDay.date);
    const term: Term = parsedDate.getTime() < s2date.getTime() ? 's1' : 's2';
    const dayString = rawDay.day as Day;

    // Flatten: Create a DailyBlock block for each period in the raw periods array
    for (const p of rawDay.periods) {
      const periodStr = p.toString() as Period;
      const rawSpecial = rawDay.specials?.[periodStr];
      
      let special: SpecialSchedule | null = null;

      if (rawSpecial) {
        special = {
          allowInterventions: rawSpecial.allowInterventions === "",
          allowAssessmentMakeups: rawSpecial.allowAssessmentMakeups === "",
          allowAltSetting: rawSpecial.allowAltSetting === "",
          allowTutoring: rawSpecial.allowTutoring === "",
          allowNonInterventions: rawSpecial.allowNonInterventions === "",
          // Convert max string to number, defaulting to 0 if it's an empty string
          max: rawSpecial.max ? parseInt(rawSpecial.max, 10) : 0,
        };
      }

      schedules.push({
        date: parsedDate,
        term: term,
        day: dayString,
        period: periodStr,
        intTeachers: [],    // Defaulting to empty array as it's missing in raw JSON
        studyTeachers: [],  // Defaulting to empty array as it's missing in raw JSON
        special: special,
      });
    }
  }

  return schedules;
}

interface RawDailyBlock {
  date: string;
  day: string;
  periods: number[];
  specials: Record<string, {
    allowInterventions: string;
    allowAssessmentMakeups: string;
    allowAltSetting: string;
    allowTutoring: string;
    allowNonInterventions: string;
    max: string;
  }>;
}
