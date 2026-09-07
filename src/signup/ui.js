import * as dom from "./dom.js"
import * as dates from "./dates.js"

/**
 * Sets up the page based on whether the current user is student or staff
 */
export const checkStaffStatus = (state) => {
  state.isStaff = dom.valueOf("input#email")?.indexOf("@walpole.k12.ma.us") > 0;
  dom.setVisible(".staff-only", state.isStaff);
}

/**
 * Sets up the page based on whether the current user is admin
 */
export const checkAdminStatus = (state) => {
  state.isAdmin = dom.valueOf("#is-admin") === "true";
  dom.setVisible(".admin-only", state.isAdmin);
}

export const initUi = (state) => {
// formats names for use in typeahed feature
  const students = state.students;
  
  initializeStudentDatalist(state.studentNames);
  
  showIntTeacherAltInput(state.interventionTeachers?.length === 0); 
  showStudyAltInput(state.studyTeachers?.length === 0);
  
  updatePeriodList();
  updateSubjectList();
  updateStudyList();
}

export const preventSignupForNoFly = (noFlyList) => {
  const email = dom.valueOf("input#email");
  if (Array.isArray(noFlyList) && (noFlyList.includes(email))) {
    dom.setDisabled("input#non-intervention", true);
    dom.setChecked("input#non-intervention", false);
    dom.setVisible("label[for='non-intervention'] span.type-warning", true);
    dom.setText("label[for='non-intervention'] span.type-warning", "Not permitted");
  }
}

export const showInterventions = () => {
  dom.setDisabled("input#intervention", true);
  dom.setChecked("input#intervention", false);
  dom.setVisible("label[for='intervention'] span.type-warning", true);
  dom.setText("label[for='intervention'] span.type-warning", "Not available");
}

export const showAssessmentMakeups = () => {
  dom.setDisabled("input#assessment", true);
  dom.setChecked("input#assessment", false);
  dom.setVisible("label[for='assessment'] span.type-warning", true);
  dom.setText("label[for='assessment'] span.type-warning", "Not available");
}

export const showAltSetting = () => {
  dom.setDisabled("input#alt-setting", true);
  dom.setChecked("input#alt-setting", false);
  dom.setVisible("label[for='alt-setting'] span.type-warning", true);
  dom.setText("label[for='alt-setting'] span.type-warning", "Not available");
}

export const showTutoring = () => {
  dom.setDisabled("input#tutoring", true);
  dom.setChecked("input#tutoring", false);
  dom.setVisible("label[for='tutoring'] span.type-warning", true);
  dom.setText("label[for='tutoring'] span.type-warning", "Not available");
}

export const showWednesdayInterventions = () => {
  dom.setDisabled("input#non-intervention", true);
  dom.setChecked("input#non-intervention", false);
  dom.setVisible("label[for='non-intervention'] span.type-warning", true);
  dom.setText("label[for='non-intervention'] span.type-warning", "Not available");
}

export const showNonInterventions = () => {
  dom.setDisabled("input#non-intervention", true);
  dom.setChecked("input#non-intervention", false);
  dom.setDisabled("input[name='purpose']", true);
  dom.setChecked("input[name='purpose']", false);
  dom.setVisible("label[for='purpose'] span.type-warning", true);
  dom.setText("label[for='purpose'] span.type-warning", "Not available");
}

/**
 *  Updates the Type options is there is a special schedule that period 
 * */
export const updateTypeOptions = (state) => {
  resetAllTypes();

  toggleTutoringActive();
  preventSignupForNoFly(state.noFlyList);
  setSpecialScheduleAdjustments(state.dailySchedules, state.signups);
}

export const resetAllTypes = () => {
  dom.setDisabled(`input[name='signup-type'], input[name='purpose']`, false);
  dom.setVisible('span.type-warning', false);

}

export const toggleTutoringActive = () => {
  const tutoringActive = dom.valueOf('#tutoring-active') === "On";
  if (!tutoringActive) {
    markTutoringDisabled();
  }
}

export const setSpecialScheduleAdjustments = (dailySchedules, signups) => {
  // returns if date or period are blank
  const dateStr = dom.valueOf("#date");
  if (dateStr.length === 0) {
    return;
  }
  const date = new Date(dateStr);

  let period = dom.valueOf("#period");
  if (typeof period === "undefined") {
    return;
  }
  
  const isWednesdayInterventions = (period === "Wed. PM");
  if (isWednesdayInterventions) {
    showWednesdayInterventions();
  }
  
  let special = {
    allowInterventions: "",
    allowAssessmentMakeups: "",
    allowAltSetting: "",
    allowTutoring: "",
    allowNonInterventions: "",
  };

  // finds schedule matches with special schedules, returns if none
  const match = dailySchedules.filter(sched => (dates.isSameDate(new Date(sched.date), date) && (sched.specials !== null)));
  if (match.length == 0) {
    return;
  }
  
  const specials = match[0].specials;
  if (specials.hasOwnProperty(period)) {
    special = specials[period];
  } else {
    // returns if no special schedule for this period
    return;
  }
  
  // for the IF statements below ANY text value counts as "not allowed".
  // if not allowed, disables the check, unchecks, and adds a label warning
  if (special.allowInterventions.length > 0) {
    showInterventions();
  }

  if ((special.allowAssessmentMakeups.length > 0) || isWednesdayInterventions) {
    showAssessmentMakeups();
  }

  if (special.allowAltSetting.length > 0) {
    showAltSetting();
  }

  if ((special.allowTutoring.length > 0) || isWednesdayInterventions) {
    showTutoring();
  }

  if ((special.allowNonInterventions.length > 0) && !isWednesdayInterventions) {
    showNonInterventions();
  }

  checkFull(signups, checkMax(special.max));
}

/**
 * Updates the Study Teacher select box based on the date and period selected 
 * */
export const updateStudyList = (studyTeachers, dailySchedules) => {
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
  const date = new Date(dateStr);

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

/**
 *  Updates the Subject select box based on the date and period selected 
 * */
export const updateSubjectList = (interventionTeachers, dailySchedules) => {
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
  const date = new Date(dateStr);
  
  const period = dom.valueOf("#period");
  if (period === null) {
    return;
  }

  if (period === "Wed. PM") {
    showIntTeacherAltInput(true);
    return;
  }
  showIntTeacherAltInput(false);

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
        dom.appendOption("#subject-int-select", teacher, teacher);
      })
    }
  })
}



// gets the max number of signsups for the date/period and checks if full
export const checkMax = (specialMax) => {
  // gets the max number of signsups for the date/period and checks if full
  setCurrentMax(specialMax);
  if (Number.isNaN(CURRENT_MAX) && (CURRENT_MAX !== "")) {
    setCurrentMax(parseInt(CURRENT_MAX));
  } else {
    setCurrentMax(DEFAULT_MAX);
  }
  checkFull(state.signups, state.currentMax);
}

export const markTutoringDisabled = () => {
  dom.setDisabled("input#tutoring", true);
  dom.setChecked("input#tutoring", false);
  showTutoring();
}

/**
 *  Updates the Details section of the form based on which Type is selected 
 * */
export const updateDetailsPanel = () => {
  if (dom.isChecked("input#intervention")) showType(".intervention-only");
  else if (dom.isChecked("input#assessment")) showType(".assessment-only");
  else if (dom.isChecked("input#tutoring")) showType(".tutoring-only");
  else if (dom.isChecked("input#non-intervention")) showType(".non-intervention-only");
  else if (dom.isChecked("input#alt-setting")) showType(".alt-setting-only");
  else if (dom.isChecked("input#staff-reservation")) showType(".staff-reservation-only");
}

/**
 *  Updates the Glass Room labels if the rooms are already reserved or not 
 * */
export const updateGlassRooms = (signups) => {
  // marks rooms as available by default
  dom.setVisible("#glass-room-1", true);
  dom.setVisible("#glass-room-2", true);
  dom.setDisabled("#glass-room-1", false);
  dom.setDisabled("#glass-room-2", false);
  dom.setText("#glass-room-1-label .availability", "Available");
  dom.setText("#glass-room-2-label .availability", "Available");

  // returns if date or period are blank
  const dateStr = dom.valueOf("#date");
  if (dateStr.length === 0) {
    return;
  }
  const date = new Date();
  date.setFullYear(
    parseInt(dateStr.split('-')[0]),
    parseInt(dateStr.split('-')[1]) - 1,
    parseInt(dateStr.split('-')[2])
  );
  date.setHours(0, 0, 0, 0); // Midnight in local timezone

  const period = dom.valueOf("#period");
  if (typeof period === "undefined") {
    return;
  }

  // cycles through signup data
  signups.forEach(signup => {
    const suDate = new Date(signup.date);
    
    // skips if dates or periods don't match
    if (!dates.isSameDate(suDate, date)) {
      return;
    }
    const suPeriod = "" + signup.period;
    if (suPeriod !== period) {
      return;
    }

    const room = signup.room;
    if ((room >= 1) && (room <= 2)) {
      // disables the checkbox
      dom.setDisabled(`#glass-room-${room}`, true);

      // unchecks the checkbox
      dom.setChecked(`#glass-room-${room}`, false);

      // updates the label
      dom.setText(`#glass-room-${room}-label .availability`, "Unavailable");
    } 
  });
}

/**
 * Updates the Periods select box based on the date 
 * */
export const updatePeriodList = (dailySchedules) => {
  // remembers current selection. If this period is available in the new list,
  const oldPeriodVal = dom.valueOf("#period");
  const dateVal = dom.valueOf("#date");
  if (dateVal === "") return;
  const date = dates.parseDateInput(dateVal);

  // clear previous options
  dom.clearOptions("#period");
  
  // cycles through daily schedules...
  dailySchedules.forEach(schedule => {
    const schedDate = new Date(schedule.date);

    // for a matching date, creates an option for each period
    if (dates.isSameDate(schedDate, date)) {
      schedule.periods.forEach(period => {
        const option = document.createElement("option");
        option.value = period;
        option.textContent = period;
        dom.appendOption("#period", period, period);
      })
    }
  })

  // console.log(date, wednesdayInterventions(date));
  if (wednesdayInterventions(date)) {
    dom.appendOption("#period", "Wed. PM", "Wed. PM");
  }

  // reselects the previously selected period, if possible
  if (oldPeriodVal !== null) {
    dom.setValue("#period", oldPeriodVal);
  } else {
    dom.setValue("#period", dom.valueOf("#period option") || "");
  }
}

/**
 * Determines if the Wednesday Interventions is active and should be shown.
 * 
 * param {Date} - the date to show
 * return {boolean} - True is should be shown
 */
function wednesdayInterventions(date) {
  const wednesday = 3;
  const weekday = date.getDay();
  const dateIsWednesday = (weekday === wednesday);
  const wedIntActive = dom.valueOf("#wed-int-active") === "true";

  // console.log("Wed Int - returning "+ (dateIsWednesday && wedIntActive));
  return dateIsWednesday && wedIntActive;
}

/**
 *  Shows the Details section for a particular Type 
 * */
function showType(typeClass) {
  // hides all panels by default
  hideTypes();

  // shows only the indicated panel
  dom.setVisible(typeClass, true);
}

/**
 *  Hides all Details sections 
 * */
function hideTypes() {
   dom.setVisible(
    ".intervention-only, .assessment-only, .tutoring-only, .non-intervention-only, .alt-setting-only, .staff-reservation-only",
    false);
}

function showStudyAltInput(show) {
  dom.setVisible("#study-teacher-select", !show);
  dom.setVisible("#study-teacher-input", show);
}

function showIntTeacherAltInput(show) {
  dom.setVisible("#subject-int-select", !show);
  dom.setVisible("#subject-int-input", show);
}



