import * as dom from "../common/dom.js"
import * as dates from "../common/dates.js"
import { store } from "./store.js";

/**
 * Publisher: Responds to user changes in the study teacher select element.
 * Updates store state only.
 */
export const studyTeacherChangeHandler = (event) => {
  const selectedTeacher = event.target.value;
  store.setState({ currentStudyTeacher: selectedTeacher });
};

/**
 * Updates the Study Teacher select box based on the date and period selected 
 * */
export const updateStudyOptions = (
  currentDateStr, 
  currentPeriod, 
  currentType, 
  studyTeachers, 
  dailySchedules = []
) => {
  // clears previous options
 dom.clearOptions("#study-teacher-select");
  
  if (!studyTeachers) return;
  
  // gets the date and period selected, returning if blank
  if (!currentDateStr || !currentPeriod) return;

  const date = dates.parseDateInput(currentDateStr);

  dom.setVisible("#study-div", true);
  if (currentPeriod === "Wed. PM") {
    dom.setVisible("#study-div", false);
  }  

  const today = new Date();
  const s2Date = new Date(studyTeachers.s2Date);

  let schedules;
  if (today.getTime() < s2Date.getTime()) {
    schedules = studyTeachers.s1;
  } else {
    schedules = studyTeachers.s2;
  }

  const altSetting = dom.valueOf("input[name='signup-type']") === "Alt setting";
  if (altSetting) {
    dom.appendOption("#study-teacher-select", "Directly from class", "Directly from class");
    dom.setAttribute("#study-teacher-select #from-class", "selected", true);
  }

  // cycles through the schedules...
  if(Array.isArray(dailySchedules)) {
    dailySchedules.forEach(sched => {
      const schedDate = new Date(sched.date);
      
      if (dates.isSameDate(schedDate, date)) {
        const day = sched.day;
        
        // if no teachers for this date/period, return
        if (!schedules?.[day] || !schedules[day][currentPeriod]) return;
        
        // create options for each teacher for this date/period
        const availableTeachers = schedules[day][currentPeriod];
        if (!availableTeachers) return;
        
        availableTeachers.forEach(teacher => {
          dom.appendOption("#study-teacher-select", teacher, teacher, false);
        })
      }
    })
  }
}
  
  export const showStudyAltInput = (studyTeachers) => {
    const show = studyTeachers?.length === 0;
    
    dom.setVisible("#study-teacher-select", !show);
    dom.setVisible("#study-teacher-input", show);
}

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
    showStudyAltInput(state.studyTeachers);
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
