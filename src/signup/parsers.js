/**
 * Safe JSON parsing helper to prevent syntax crashes on corrupt or missing strings.
 */
const safeJsonParse = (data, fallback = []) => {
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
export const parseStudents = (students) => {
  return Array.isArray(students) ? students : [];
}

export const parseStudentNames = (students) => {
  if (!Array.isArray(students)) return [];
  return students.map(student => `${student.lastname}, ${student.firstname} <${student.email}>`);
};

/**
 *  parses daily schedule data from the server 
 * */
export const parseDailySchedules = (schedules) => {
  return safeJsonParse(schedules, []);
}

/**
 *  parses teacher intervention data from the server 
 * */
export const parseInterventionTeachers = (schedulesJson) => {
  // graceful fallback; if the intervention schedule can't be found, 
  // use an input box instead of a select box
  return safeJsonParse(schedulesJson, []);
}

/**
 *  parses no fly from the server 
 * */
export const parseNoFlyList = (emails) => {
  return Array.isArray(emails) ? emails : [];
}

/**
 *  parses max signups from the server 
 * */
export const parseMaxSignups = (maxValue) => {
 const parsed = Number(maxValue);
  return Number.isNaN(parsed) ? 15 : parsed;
}

/**
 *  parses signup data from the server 
 * */
export const parseSignups = (signups) => {
  return safeJsonParse(signups, []);
}


/**
 *  parses teacher intervention data from the server 
 * */
export const parseStudyTeachers = (studyTeachersJson) => {
  return safeJsonParse(studyTeachersJson, []);
}

/**
 *  parses signup data from the server (if updating instead of creating new) 
 * */
export const parseUpdateStudent = (signupJson) => {
  return safeJsonParse(signupJson, null);
}
