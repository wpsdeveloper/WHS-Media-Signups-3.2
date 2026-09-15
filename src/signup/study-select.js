import * as dom from "../common/dom.js";
import * as dates from "../common/dates.js";
import { store } from "./store.js";

/**
 * Publisher: Responds to user changes in the study teacher select element.
 */
export const studyTeacherChangeHandler = (event) => {
  const selectedTeacher = event.target.value;
  store.setState({ currentStudyTeacher: selectedTeacher });
};

/**
 * Pure UI View: Calculates options from state and renders select dropdown/input elements.
 */
export const updateStudyOptions = (
  currentDateStr, 
  currentPeriod,  
  currentType,
  studyTeachers, 
  dailySchedules = []
) => {
  dom.clearOptions("#study-teacher-select");
  if (!studyTeachers || !currentDateStr || !currentPeriod) {
    return;
  }
  toggleStudyInputVisibility(false);
  
  // Toggle outer section visibility for Wed. PM
  dom.setVisible("#study-div", currentPeriod !== "Wed. PM");

  const date = dates.parseDateInput(currentDateStr);
  const today = new Date();
  const s2Date = new Date(studyTeachers.s2Date);
  const schedules = dates.chooseSemester(today, s2Date) === "2" ? studyTeachers.s2 : studyTeachers.s1;

  const availableTeachers = [];

  if (currentType === "Alt setting") {
    availableTeachers.push("Directly from class");
  }

  if (Array.isArray(dailySchedules)) {
    const matchingSched = dailySchedules.find(sched => dates.isSameDate(new Date(sched.date), date));
    if (matchingSched && schedules?.[matchingSched.day]?.[currentPeriod]) {
      const teachers = schedules[matchingSched.day][currentPeriod];
      if (Array.isArray(teachers)) {
        availableTeachers.push(...teachers);
      }
    }
  }

  // Render options
  availableTeachers.forEach(teacher => {
    dom.appendOption("#study-teacher-select", teacher, teacher, false);
  });

  // State-driven UI toggle
  toggleStudyInputVisibility(availableTeachers.length > 0);
};

/**
 * Pure UI Helper: Toggles visibility based on computed options state.
 */
export const toggleStudyInputVisibility = (hasOptions) => {
  dom.setVisible("#study-teacher-select", hasOptions);
  dom.setVisible("#study-teacher-input", !hasOptions);
};

/**
 * Subscriber: Re-calculates and re-populates options when key state items change.
 */
export const setupStudyOptionsObserver = () => {
  store.subscribe((state) => {
    updateStudyOptions(
      state.currentDate,
      state.currentPeriod,
      state.currentType,
      state.studyTeachers,
      state.dailySchedules
    );
  }, ['currentDate', 'currentPeriod', 'currentType', 'studyTeachers', 'dailySchedules']);
};

/**
 * Subscriber: Synchronizes DOM selection with state.currentStudyTeacher.
 */
export const setupStudySelectValueObserver = () => {
  store.subscribe((state) => {
    const selectElem = dom.qs("#study-teacher-select");
    if (selectElem && state.currentStudyTeacher && selectElem.value !== state.currentStudyTeacher) {
      dom.setValue("#study-teacher-select", state.currentStudyTeacher);
    }
  }, ['currentStudyTeacher']);
};