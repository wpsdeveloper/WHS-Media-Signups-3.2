import * as dom from "./dom.js"
import * as dates from "./dates.js"

/**
 * Updates the Study Teacher select box based on the date and period selected 
 * */
export const updateStudyOptions = (state) => {
  const studyTeachers = state.studyTeachers;
  const dailySchedules = state.dailySchedules;

   // clears previous options
  dom.clearOptions("#study-teacher-select");

  // only proceeds if the select box is still here
  if (studyTeachers === null) {
    return;
  }
  
  // gets the date and period selected, returning if blank
  const dateStr = dom.valueOf("#date");
  if (dateStr.length === 0) {
    return;
  }
  const date = dates.parseDateInput(dateStr);

  const period = dom.valueOf("#period");
  if (period === null) {
    return;
  }

  dom.setVisible("#study-div", true);
  if (period === "Wed. PM") {
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

  const altSetting = dom.valueOf("input[name='signup-type']:checked") === "Alt setting";
  if (altSetting) {
    dom.appendOption("#study-teacher-select", "Directly from class", "Directly from class");
    dom.setAttribute("#study-teacher-select #from-class", "selected", true);
  }

  // cycles through the schedules...
  dailySchedules.forEach(sched => {
    const schedDate = new Date(sched.date);

    if (dates.isSameDate(schedDate, date)) {
      // if the date is in the schedule...
      const day = sched.day;

      // if no teachers for this date/period, return
      if ((typeof schedules[day] === "undefined") || (typeof schedules[day][period] === "undefined")) {
        return;
      }

      // create options for each teacher for this date/period
      const availableTeachers = schedules[day][period];
      if (!availableTeachers) {
        return;
      }
      
      availableTeachers.forEach(teacher => {
        dom.appendOption("#study-teacher-select", teacher, teacher, false);
      })
    }
  })
}

export const showStudyAltInput = (show) => {
  dom.setVisible("#study-teacher-select", !show);
  dom.setVisible("#study-teacher-input", show);
}
