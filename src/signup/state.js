// Shared signup form state.
export let STUDENTS = [];
export let STUDENT_NAMES;
export let DAILY_SCHEDULES = [];
export let INTERVENTION_TEACHERS = {};
export let STUDY_TEACHERS = {};
export let SIGNUPS = [];
export let NO_FLY = [];

export let IS_STAFF = false;
export let IS_EDITOR = false;
export let IS_ADMIN = false;
export let UPDATE_ROW_ID = null;
export let UPDATE_DATA = null;
export let DEFAULT_MAX = 15;
export let CURRENT_MAX = DEFAULT_MAX;

export function setStudents(value) {
  STUDENTS = value;
}

export function setStudentNames(value) {
  STUDENT_NAMES = value;
}

export function setDailySchedules(value) {
  DAILY_SCHEDULES = value;
}

export function setInterventionTeachers(value) {
  INTERVENTION_TEACHERS = value;
}

export function setStudyTeachers(value) {
  STUDY_TEACHERS = value;
}

export function setSignups(value) {
  SIGNUPS = value;
}

export function setNoFly(value) {
  NO_FLY = value;
}

export function setIsStaff(value) {
  IS_STAFF = value;
}

export function setIsEditor(value) {
  IS_EDITOR = value;
}

export function setIsAdmin(value) {
  IS_ADMIN = value;
}

export function setUpdateRowId(value) {
  UPDATE_ROW_ID = value;
}

export function setUpdateData(value) {
  UPDATE_DATA = value;
}

export function setDefaultMax(value) {
  DEFAULT_MAX = value;
}

export function setCurrentMax(value) {
  CURRENT_MAX = value;
}
