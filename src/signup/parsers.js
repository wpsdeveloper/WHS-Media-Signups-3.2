/**
 *  Receives student data from the server 
 */
export const parseStudents = (students) => {
  return students || [];
}

export const parseStudentNames = (students) => {
  return students.map(student => `${student.lastname}, ${student.firstname} <${student.email}>`) || [];
}

/**
 *  parses daily schedule data from the server 
 * */
export const parseDailySchedules = (schedules) => {
  return JSON.parse(schedules) || [];
  // console.log("DAILY_SCHEDULES", DAILY_SCHEDULES);
}

/**
 *  parses teacher intervention data from the server 
 * */
export const parseInterventionTeachers = (schedulesJson) => {
  // graceful fallback; if the intervention schedule can't be found, 
  // use an input box instead of a select box
  return JSON.parse(schedulesJson) || [];
  
}

/**
 *  parses no fly from the server 
 * */
export const parseNoFlyList = (emails) => {
  return emails || [];
}

/**
 *  parses max signups from the server 
 * */
export const parseMaxSignups = (maxValue) => {
  return maxValue || 0;
}

/**
 *  parses signup data from the server 
 * */
export const parseSignups = (signups) => {
  return JSON.parse(signups) || [];
}


/**
 *  parses teacher intervention data from the server 
 * */
export const parseStudyTeachers = (studyTeachersJson) => {
  // graceful fallback; if the study hall schedule can't be found, 
  // use an input box instead of a select box
  return JSON.parse(studyTeachersJson) || [];
}

/**
 *  parses signup data from the server (if updating instead of creating new) 
 * */
export const parseUpdateStudent = (signupJson) => {
  if (signupJson === null) {
    processError(new Error("Invalid URL parameters"), "Error parsing signup data:");
    return;
  }
  const signup = JSON.parse(signupJson);
  // console.log("SIGNUP", signup);
  return signup;
}
