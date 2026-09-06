import {
  setStudents,
  setStudentNames,
  setDailySchedules,
  setInterventionTeachers,
  setStudyTeachers,
  setSignups,
  setNoFly,
  setDefaultMax,
  setCurrentMax,
} from "./state.js";
import { $, setDisabled, setChecked, parseJsonValue } from "./dom.js";

export function parseInitialData(data, hooks) {
  parseStudents(data.students, hooks);
  parseDailySchedules(data.dailySchedules, hooks);
  parseSignups(data.signups);
  parseInterventionTeachers(data.interventionTeachers, hooks);
  parseStudyTeachers(data.studyTeachers, hooks);
  parseNoFlyList(data.noFlyList);
  parseMaxSignups(data.defaultMaxSignups);

  hooks.hideLoadingModal();
  hooks.typeChanged();
  if (hooks.getUpdateData() !== null) {
    hooks.populateData(hooks.getUpdateData());
  }
}

export function parseDailySchedules(schedules, hooks = {}) {
  setDailySchedules(parseJsonValue(schedules) || []);
  hooks.updatePeriodList?.();
}

export function parseInterventionTeachers(schedulesJson, hooks = {}) {
  setInterventionTeachers(parseJsonValue(schedulesJson));
  hooks.showIntTeacherAltInput?.(false);
  if (!hooks.getInterventionTeachers() || (!hooks.getInterventionTeachers().s1 && !hooks.getInterventionTeachers().s2)) {
    hooks.showIntTeacherAltInput?.(true);
  }
  hooks.updateSubjectList?.();
}

export function parseNoFlyList(emailsJson) {
  setNoFly(parseJsonValue(emailsJson) || []);
}

export function parseMaxSignups(maxValueJson) {
  const maxValue = parseJsonValue(maxValueJson);
  if (!Number.isNaN(maxValue) && (maxValue >= 0)) {
    setDefaultMax(maxValue);
    setCurrentMax(maxValue);
  } else {
    console.error("Error parsing max signups value: " + maxValue);
  }
}

export function parseSignups(signups) {
  setSignups(parseJsonValue(signups) || []);
}

export function parseStudents(studentsJson, hooks = {}) {
  const students = parseJsonValue(studentsJson) || [];
  setStudents(students);
  setStudentNames(students.map(student => `${student.lastname}, ${student.firstname} <${student.email}>`));
  hooks.initializeStudentDatalist?.();
}

export function parseStudyTeachers(studyTeachersJson, hooks = {}) {
  setStudyTeachers(parseJsonValue(studyTeachersJson));
  hooks.showStudyAltInput?.(false);
  if (!hooks.getStudyTeachers() || (!hooks.getStudyTeachers().s1 && !hooks.getStudyTeachers().s2)) {
    hooks.showStudyAltInput?.(true);
  }
  hooks.updateStudyList?.();
}

export function disableOption(inputSelector, message) {
  setDisabled(inputSelector, true);
  setChecked(inputSelector, false);
  const input = $(inputSelector);
  const label = input ? document.querySelector(`label[for='${input.id}']`) : null;
  label?.insertAdjacentHTML("beforeend", `<span class='type-warning'> <i>${message}</i></span>`);
}
