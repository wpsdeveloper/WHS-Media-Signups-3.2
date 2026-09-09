import * as dom from "./dom.js"
import { parseDateInput, isSameDate } from "./dates.js"
import { toggleIntTeacherAltInput } from "./interventions-teacher-select.js";


/**
 *  Updates the Subject select box based on the date and period selected 
 * */
export const updateSubjectOptions = (interventionTeachers, dailySchedules) => {
  // clears previous options
   dom.clearOptions("#subject-int-select");

  // only proceeds if the select box is still here
  if (interventionTeachers === null) {
    return;
  }
  
  // gets the date and period selected, returning if blank
  const dateStr = dom.valueOf("#date");
  if (dateStr.length === 0) {
    return;
  }
  const date = parseDateInput(dateStr);
  
  const period = dom.valueOf("#period");
  if (period === null) {
    return;
  }

  if (period === "Wed. PM") {
    toggleIntTeacherAltInput(true);
    return;
  }
  toggleIntTeacherAltInput(false);

  const today = new Date();
  const s2Date = new Date(interventionTeachers.s2Date);

  let schedules;
  if (today.getTime() < s2Date.getTime()) {
    schedules = interventionTeachers.s1;
  } else {
    schedules = interventionTeachers.s2;
  }
  
  // cycles through the schedules...
  dailySchedules.forEach(sched => {
    const schedDate = new Date(sched.date);

    if (isSameDate(schedDate, date)) {
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
        dom.appendOption("#subject-int-select", teacher, teacher);
      })
    }
  })
}