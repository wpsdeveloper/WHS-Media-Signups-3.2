import * as dom from "../common/dom.js"
import { parseDateInput, isSameDate } from "../common/dates.ts"
import { store } from "../common/store";

/**
 * Publisher: Responds to user subject selection changes.
 * Updates store state only.
 */
export const subjectChangeHandler = (event) => {
  const selectedSubject = event.target.value;
  store.setState({ currentSubject: selectedSubject });
};

/**
 *  Updates the Subject select box based on the date and period selected 
 * */
export const updateSubjectOptions = (
  currentDateStr,
  currentPeriod,
  interventionTeachers,
  dailySchedules = []
) => {
  // clears previous options
   dom.clearOptions("#subject-int-select");

  if (!interventionTeachers || !currentDateStr || !currentPeriod) return;

  const date = parseDateInput(currentDateStr);

  const today = new Date();
  const s2Date = new Date(interventionTeachers.s2Date);

  let schedules;
  if (today.getTime() < s2Date.getTime()) {
    schedules = interventionTeachers.s1;
  } else {
    schedules = interventionTeachers.s2;
  }

  // cycles through the schedules...
  if (Array.isArray(dailySchedules)) {
    dailySchedules.forEach(sched => {
      const schedDate = new Date(sched.date);
      
      if (isSameDate(schedDate, date)) {
        const day = sched.day;
        
        if (!schedules?.[day] || !schedules[day][currentPeriod]) return;
        
        // create options for each teacher for this date/period
        const availableTeachers = schedules[day][currentPeriod];
        if (!availableTeachers) {
          return;
        }
        
        availableTeachers.forEach(teacher => {
          dom.appendOption("#subject-int-select", teacher, teacher);
        })
      }
    })
  }
}

/**
 * Subscriber: Re-calculates and populates subject options when dependencies change.
 */
export const setupSubjectOptionsObserver = () => {
  store.subscribe((state) => {
    updateSubjectOptions(
      state.currentDate,
      state.currentPeriod,
      state.interventionTeachers,
      state.dailySchedules
    );
  }, ['currentDate', 'currentPeriod', 'interventionTeachers', 'dailySchedules']);
};

/**
 * Subscriber: Synchronizes DOM selection with state.currentSubject.
 */
export const setupSubjectValueObserver = () => {
  store.subscribe((state) => {
    const selectElem = dom.qs("#subject-int-select");
    if (selectElem && state.currentSubject && selectElem.value !== state.currentSubject) {
      dom.setValue("#subject-int-select", state.currentSubject);
    }
  }, ['currentSubject']);
};