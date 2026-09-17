import { Student } from "../../shared/types/students";
import { Setting } from "../../shared/types/settings";

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
export const parseDailySchedules = (schedules: string) => {
  return safeJsonParse(schedules, []);
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
