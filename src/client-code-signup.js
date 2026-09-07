/** ======= CLIENT CODE  ======== 
 * Javascript code (client-side) for the Signup Form
 * 
 * Media Center Sign Up System
 * Walpole High School, Walpole, MA
 * @author: Tom Reeve, treeve@walpole.k12.ma.us
 *
 * Note: This script handles both new submissions and the updating of existing data.
 * Updates are done by appending "?page=update&id" plus the record's row id to the URL.
 */  

import {
  STUDENT_NAMES,
  DAILY_SCHEDULES,
  INTERVENTION_TEACHERS,
  STUDY_TEACHERS,
  SIGNUPS,
  NO_FLY,
  IS_STAFF,
  IS_EDITOR,
  IS_ADMIN,
  UPDATE_ROW_ID,
  UPDATE_DATA,
  CURRENT_MAX,
  DEFAULT_MAX,
  setIsStaff,
  setIsAdmin,
  setIsEditor,
  setUpdateRowId,
  setUpdateData,
  setStudents,
  setStudentNames,
  setSignups,
  setDailySchedules,
  setInterventionTeachers,
  setStudyTeachers,
  setNoFly,
  setCurrentMax,
  setDefaultMax,
} from "./signup/state.js";
import {
  $,
  $$,
  valueOf, setValue,
  isVisible, setVisible,
  isChecked, setChecked,
  getAttribute, setAttribute,
  setText,
  setDisabled,
  setInvalid,
  appendOption,
  clearOptions,
  addEventListener,
  parseJsonValue,
  initializeStudentDatalist,
  showBootstrapModal,
  hideBootstrapModal,
  showBootstrapToast,
  configureDateInput,
  setTooltips,
} from "./signup/dom.js";

import {
  parseDateInput,
  toDateInputValue,
  updatePeriodList as renderPeriodList,
  getTeachersForSelection,
  updateSubjectList as renderSubjectList,
  updateStudyList as renderStudyList,
} from "./signup/schedule.js";

/* Initialization, after everything has loaded */
document.addEventListener("DOMContentLoaded", () => {
  initializeUi();
  bindEvents();
  showLoadingModal("Retrieving data");
  updateDetailsPanel();

  // preps for whether this page is a new submission or an update to existing data
  setUpdateStatus();
  
  checkStaffStatus();
  checkAdminStatus();

  // gathers all data needed to populate the form
  getInitialData();
});

function bindEvents() {
  addEventListener('input[name="signup-type"]', "change", typeChanged);
  addEventListener('#date', "change", dateChanged);
  addEventListener('#period', "change", periodChanged);
  addEventListener('#btn-submit', "click", submitForm);
  addEventListener('#btn-update', "click", submitForm);
  addEventListener('.success-box-start-over', "click", startOver); 
}

async function getInitialData() {
  const url = window.location.href;
  if ((url.indexOf("localhost") >=0 ) || (url.indexOf("127.0.0.1") >= 0)) {
    await setMockData();
  } else {
    google.script.run
    .withFailureHandler(processError)
    .withSuccessHandler(receiveInitialData)
    .getInitialSignupFormData();
  }
}

function receiveInitialData(data) {
  console.log(data);
  receiveStudents(data.students);
  receiveDailySchedules(data.dailySchedules);
  receiveSignups(data.signups);
  receiveInterventionTeachers(data.interventionTeachers);
  receiveStudyTeachers(data.studyTeachers);
  receiveNoFlyList(data.noFlyList);
  receiveMaxSignups(data.defaultMaxSignups);

  hideLoadingModal();
  typeChanged();
  if (UPDATE_DATA !== null) {
    populateData(UPDATE_DATA);
  }
}

async function setMockData() {
  setValue("#email", "wpsdeveloper@walpole.k12.ma.us");
  setValue("#update-row-id", "");
  setIsStaff(true);
  setIsEditor(true);
  setIsAdmin(true);
  checkStaffStatus();

  const sampleData = await import("../sampledata.js");
  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
  await delay(2000); 
  
  receiveInitialData(sampleData.default);
}

/**
 * Calculates if a given date/period is full (too many existing reservations) 
 * */
function checkFull() {
  // console.log("checking if full");
  
  // gets the date and period selected, returning if blank
  const dateVal = valueOf("#date");
  if (dateVal === "") {
    return;
  }
  const date = new Date(dateVal);
  
  const period = valueOf("#period");
  if (period === null) {
    return;
  }

  // finding signups that match the date and period
  let matching = SIGNUPS.filter(su => (isSameDate(new Date(su.date), date)) && (period == "" + su.period));

  // filters for only non-intervention and tutoring
  matching = matching.filter(su => (su.type === "Non-intervention") || (su.type === "Tutoring"));
 
  if (matching.length >= CURRENT_MAX) {
    console.info("Over limit, max = " + CURRENT_MAX);
    
    if (matching.length >= CURRENT_MAX) {
      ["#non-intervention", "#tutoring"].forEach(selector => {
        setDisabled(selector, true);
        setChecked(selector, false);
        setVisible(`${selector} label span.type-warning`, true);
        setText(`${selector} label span.type-warning`, "Full");
      
        // const label = document.querySelector(`label[for='${selector.substring(1)}']`);
        // if (!label.querySelector("span.type-warning")) {
        //   const span = document.createElement("span");
        //   span.textContent = " Full";
        //   span.addClass("type-warning");
        //   $(label)?.append(span);
        // }
          // label.querySelector("span.type-warning").html("<span class='type-warning'> Full</span>");
      });
    }
  }
}

/**
 * Sets up the page based on whether the current user is student or staff
 */
function checkStaffStatus() {
  setIsStaff(valueOf("input#email").indexOf("@walpole.k12.ma.us") > 0);
  setVisible(".staff-only", IS_STAFF);
}

/**
 * Sets up the page based on whether the current user is admin
 */
function checkAdminStatus() {
  setIsAdmin(valueOf("#is-admin") === "true");
  setVisible(".admin-only", IS_ADMIN);
}

/**
 * Gathers all entered form data in prep for validation and submission 
 * @return {SignupData}
 * */
function collectData() {
  const data = {};
  
  data.email = valueOf("#email");
  
  // sets at least blanks for the names
  data.firstname = "";
  data.lastname = "";

  if (isVisible("#student")) {
    // this is a teacher submission
    // breaks apart the line selected in the typeahead
    const student = valueOf("#student");
    const brackets = student.indexOf(" <") >0 ? student.split(" <") : [];
    const names = (brackets.length > 0) ? brackets[0].split(", ") : [];

    data.firstname = names.length > 0 ? names[1] : "";
    data.lastname = names.length > 0 ? names[0] : "";
    data.emailStudent = (brackets.length == 2) ? brackets[1].trim().substring(0, brackets[1].length-1) : "";
  } else {
    // this is a student submission
    data.emailStudent = data.email;
  }
  data.date = valueOf("#date");
  data.period = valueOf("#period");
  data.type = valueOf("input[name='signup-type']:checked");
  
  // gets subject from whichever is visible
  if (isVisible(".subject-int")) {
    data.subject = valueOf(".subject-int:visible");
  } else if (isVisible("#subject-non-int")) {
    data.subject = valueOf("#subject-non-int");
  }

  data.purpose = isVisible("#purpose") ? valueOf("#purpose input[type='radio']:checked") : "";
  data.room = isVisible("#glass-room") ? valueOf("#glass-room input[type='radio']:checked") : "";
  data.teacherStudy = valueOf(".study-teacher");
  data.teacherAcad = valueOf("#acad-teacher");
  data.comments = valueOf("#topic-intervention");

  console.log(data);
  return data;
}

/**
 *  Responds to a change in the Date field 
 * */
function dateChanged() {
  updatePeriodList();
  periodChanged();
}

/**
 * Formats a Date into MM/DD/YYYY
 * 
 * @param {Date} date The date to format
 * @return {string} The formatted string
 */
function formatDateSlashes(date) {
  return (date.getMonth()+1) +"/" + date.getDate() + "/" + date.getFullYear();
}

/**
 *  Logic for each field to determine if valid or not 
 * 
 * @return {string[]} Array of class names to mark aas invalid
 * */
function getInvalidFields() {
  const invalidFields = [];
  
  // gathers form data
  const data = collectData();

  // requires student names if student is visible (teacher submission)
  if (isVisible("#student")) {
    if (data.firstname.length <= 0) {
      invalidFields.push("#student");
    }
    if (data.lastname.length <= 0) {
      invalidFields.push("#student");
    }
  }

  // why is this here?
  const now = new Date();
  
  // requires valid date
  let dateReq = null;
  try {
    if (data.date.length <= 0) {
      invalidFields.push("#date");
    }
    dateReq = new Date(data.date);
    const month = dateReq.getMonth();
  } catch(error) {
    invalidFields.push("#date");
  }

  // requires period is selected
  if (data.period.length <=0) {
    invalidFields.push("#period");
  }

  // requires study teacher is selected/input
  if (isVisible("#study-teacher") && (data.teacherStudy.length <= 0)) {
    invalidFields.push("#study-teacher");
  }

  // requires type is selected
  if (data.type.length <=0) {
    invalidFields.push("#type");
  }

  // if one of these types, requires academic teacher is input
  if ((data.type === "Non-intervention") || (data.type === "Assessment") || (data.type === "Alt setting")){
    if (data.teacherAcad.length <=0) {
      invalidFields.push("#acad-teacher");
    }
  }

  // sends invalid class names back
  return invalidFields;
}

/**
 *  Hides the loading modal 
 * */
function hideLoadingModal() {
  hideBootstrapModal("#loading-modal");
}

/**
 *  Hides all Details sections 
 * */
function hideTypes() {
   setVisible(
    ".intervention-only, .assessment-only, .tutoring-only, .non-intervention-only, .alt-setting-only, .staff-reservation-only",
    false);
}

/**
 * Sets up some UI elements, such as the date picker and tooltips
 */
function initializeUi() {
  const today = new Date();
  configureDateInput("#date",
    toDateInputValue(new Date(today.getTime() - 14 * 86400000)),
    toDateInputValue(new Date(today.getTime() + 14 * 86400000)),
    toDateInputValue(today)
  );
  
  setTooltips('[data-bs-toggle="tooltip"]');

  setVisible(".int-link", (getAttribute(".int-link", "href") || "").length > 58);
  setVisible(".tut-link", (getAttribute("href") || "").length > 58);
}

/** 
 * Determines if two Date object are the same date, regardless of time-of-day
 * 
 * @param {Date} date1 The first date to compare
 * @param {Date} date2 The second date to compare
 * @return {boolean} True if the two dates are the same
 */
function isSameDate(date1, date2) {
  const monthMatch = date1.getMonth() === date2.getMonth();
  const yearMatch = date1.getFullYear() === date2.getFullYear();
  const dateMatch = date1.getDate() === date2.getDate();

  return monthMatch && yearMatch && dateMatch;
}

/**
 *  Responds to a change in the Period field 
 * */
function periodChanged() {
  updateTypeOptions();
  updateSubjectList();
  updateStudyList();
  updateGlassRooms();
  checkFull();
}

/**
 * Populates data into the form (useful for editing existing data)
 * 
 * @param {SignupData} signup A record of signup date to enter into fields
 */
function populateData(signup) {
  setValue("#student", `${signup.lastname}, ${signup.firstname} <${signup.emailStudent}`);
  setValue("#date", formatDateSlashes(new Date(signup.date)));
  dateChanged();
  
  setValue("#period", "" + signup.period);
  periodChanged();
  
  setValue("#subject").val(signup.subject);
  setValue("#study-teacher", signup.teacherStudy);
  setValue("#acad-teacher", signup.teacherAcad);

  // unchecks Types, and check the correct one
  setValue("#type input").prop("checked", "false");
  setValue(`#type input[value="${signup.type}"]`).prop("checked", "true");
  typeChanged();

  // unchecks all Purposes and then checks the correct one 
  setChecked("#purpose input", false);
  setChecked(`#purpose input[value="${signup.purpose}"]`, true);

  // unchecks all Glass Rooms and then checks the correct one 
  setChecked("#glass-room input", false);
  setChecked(`#glass-room input[value="${signup.room}"]`, true);

  // fills the topic/comments
  setValue("#topic-intervention", signup.comments);
}

/**
 *  For testing the form only 
 * */
function populateTestData() {
  populateData({
    comments: "",
    date: "3/6/2024",
    email: "demowhs@wpsma.org",
    firstname: "Belinda",
    lastname: "Zzdemo",
    mediaIn: "",
    mediaOut: "",
    period: "8",
    purpose: "Group-project",
    room: 1,
    rowId: "",
    studyIn1: "",
    studyIn2: "",
    subject: "",
    teacherAcad: "Hahn",
    teacherStudy: "Reeve",
    timestamp: "3/1/2024",
    type: "Non-intervention",
  })
}

/**
 *  Prevents default HTML submission behavior (generally, prevent form submit if the user hits Enter) 
 * */
function preventFormSubmit() {
  var forms = document.querySelectorAll('form');
  for (var i = 0; i < forms.length; i++) {
    forms[i].addEventListener('submit', function(event) {
      event.preventDefault();
    });
  }
};

/**
 *  Receives daily schedule data from the server 
 * */
function receiveDailySchedules(schedules) {
  setDailySchedules(JSON.parse(schedules));
  // console.log("DAILY_SCHEDULES", DAILY_SCHEDULES);
  updatePeriodList();
}

/**
 *  Receives teacher intervention data from the server 
 * */
function receiveInterventionTeachers(schedulesJson) {
  // graceful fallback; if the intervention schedule can't be found, 
  // use an input box instead of a select box
  setInterventionTeachers(JSON.parse(schedulesJson));
  showIntTeacherAltInput(false);
  if (INTERVENTION_TEACHERS === null) {
    showIntTeacherAltInput(true);
  } else {
  }
  updateSubjectList();
}

/**
 *  Receives no fly from the server 
 * */
function receiveNoFlyList(emails) {
  setNoFly(emails);
}

/**
 *  Receives max signups from the server 
 * */
function receiveMaxSignups(maxValue) {
  console.log(`maxValue ${maxValue}`);
  if (!Number.isNaN(maxValue) && (maxValue >= 0)) {
    setDefaultMax(maxValue);
    setCurrentMax(maxValue);
  } else {
    console.error("Error parsing max signups value: " + maxValue);
  }
}

/**
 *  Receives signup data from the server 
 * */
function receiveSignups(signups) {
  setSignups(JSON.parse(signups));
  // console.log("SIGNUPS", SIGNUPS);
}

/**
 *  Receives student data from the server 
 */
function receiveStudents(students) {
  setStudents(students);
  // console.log("STUDENTS", STUDENTS);

  // formats names for use in typeahed feature
  setStudentNames(students.map(student => `${student.lastname}, ${student.firstname} <${student.email}>`));
  initializeStudentDatalist(STUDENT_NAMES);
}

/**
 *  Receives teacher intervention data from the server 
 * */
function receiveStudyTeachers(studyTeachersJson) {
  // graceful fallback; if the study hall schedule can't be found, 
  // use an input box instead of a select box
  showStudyAltInput(false);
  if (STUDY_TEACHERS === null) {
    showStudyAltInput(true);
  } else {
    setStudyTeachers(JSON.parse(studyTeachersJson));
  }
  updateStudyList();
  // console.log("STUDY_TEACHERS", STUDY_TEACHERS);
}

function showStudyAltInput(show) {
  setVisible("#study-teacher-select", !show);
  setVisible("#study-teacher-input", show);
}

function showIntTeacherAltInput(show) {
  setVisible("#subject-int-select", !show);
  setVisible("#subject-int-input", show);
}

/**
 *  Shows the Details section for a particular Type 
 * */
function showType(typeClass) {
  // hides all panels by default
  hideTypes();

  // shows only the indicated panel
  setVisible(typeClass, true);
}

/**
 * Resets the page for another submission 
 * */
 function startOver() {
  setValue("#student", "");
  setValue("#purpose", "");
  setValue("#study-teacher-input", "");
  setValue("#acad-teacher", "");
  setValue("#topic-intervention", "");
  setValue("#subject-int-select", "");
  setVisible("#form", true);
  setVisible("#success-box", false);
 }

/**
 *  Responds to a successful submission notice from the server 
 * */
function submitComplete(success) {
  showSuccessToast("Submission complete");
  hideLoadingModal();

  // shows success panel, hides input fields
  setVisible("#form", false);
  setVisible("#success-box", true);
}

/**
 *  Sends the form data to the server for submission 
 * */
function submitForm(){
  // returns if form is not validated (validation indicators occur in validateForm function)
  if (!validateForm()) {
    return;
  }
  // gathers the form data
  const data = collectData();

  if ((UPDATE_ROW_ID === null) || (UPDATE_ROW_ID === "")) {
    // new submission

    google.script.run
      .withSuccessHandler(submitComplete)
      .withFailureHandler(processError)
      .submitForm(data);
  } else {
    // updating existing records

    data.rowId = UPDATE_ROW_ID;
    google.script.run
      .withSuccessHandler(updateComplete)
      .withFailureHandler(processError)
      .submitForm(data);
  }
  
  showLoadingModal("Submitting");
}

/**
 *  Responds to a change in the Type field 
 * */
function typeChanged() {
  updateTypeOptions();
  checkFull();
  updateDetailsPanel();
  updateStudyList();
  updateSubjectList();
}

/**
 *  Responds to a successful update notice from the server 
 * */
function updateComplete(success) {
  showSuccessToast("Update complete.");
  hideLoadingModal();

  // shows success panel, hides input fields
  setVisible("#form", false);
  setVisible("#success-update-box", true);
}

/**
 *  Updates the Details section of the form based on which Type is selected 
 * */
function updateDetailsPanel() {
  if (isChecked("input#intervention")) showType(".intervention-only");
  else if (isChecked("input#assessment")) showType(".assessment-only");
  else if (isChecked("input#tutoring")) showType(".tutoring-only");
  else if (isChecked("input#non-intervention")) showType(".non-intervention-only");
  else if (isChecked("input#alt-setting")) showType(".alt-setting-only");
  else if (isChecked("input#staff-reservation")) showType(".staff-reservation-only");
}

/**
 *  Updates the Glass Room labels if the rooms are already reserved or not 
 * */
function updateGlassRooms() {
  // marks rooms as available by default
  setVisible("#glass-room-1", true);
  setVisible("#glass-room-2", true);
  setDisabled("#glass-room-1", false);
  setDisabled("#glass-room-2", false);
  setText("#glass-room-1-label .availability", "Available");
  setText("#glass-room-2-label .availability", "Available");

  // returns if date or period are blank
  const dateStr = valueOf("#date");
  if (dateStr.length === 0) {
    return;
  }
  const date = new Date(dateStr);

  const period = valueOf("#period");
  if (typeof period === "undefined") {
    return;
  }

  // cycles through signup data
  SIGNUPS.forEach(signup => {
    const suDate = new Date(signup.date);
    
    // skips if dates or periods don't match
    if (!isSameDate(suDate, date)) {
      return;
    }
    const suPeriod = "" + signup.period;
    if (suPeriod !== period) {
      return;
    }

    const room = signup.room;
    if ((room >= 1) && (room <= 2)) {
      // disables the checkbox
      setDisabled(`#glass-room-${room}`, true);

      // unchecks the checkbox
      setChecked(`#glass-room-${room}`, false);

      // updates the label
      setText(`#glass-room-${room}-label .availability`, "Unavailable");
    } 
  });
}

/**
 * Updates the Periods select box based on the date 
 * */
function updatePeriodList() {
  // remembers current selection. If this period is available in the new list,
  const oldPeriodVal = valueOf("#period");
  const dateVal = valueOf("#date");
  if (dateVal === "") return;
  const date = parseDateInput(dateVal);

  try {
    // clear previous options
    clearOptions("#period");

    // gets the data selected
    const date = new Date(dateVal);
    
    // cycles through daily schedules...
    DAILY_SCHEDULES.forEach(schedule => {
      const schedDate = new Date(schedule.date);

      // for a matching date, creates an option for each period
      if (isSameDate(schedDate, date)) {
        schedule.periods.forEach(period => {
          const option = document.createElement("option");
          option.value = period;
          option.textContent = period;
          appendOption("#period", period, period);
        })
      }
    })

    // console.log(date, wednesdayInterventions(date));
    if (wednesdayInterventions(date)) {
      appendOption("#period", "Wed. PM", "Wed. PM");
    }

    // reselects the previously selected period, if possible
    if (oldPeriodVal !== null) {
      setValue("#period", oldPeriodVal);
    } else {
      setValue("#period", valueOf("#period option") || "");
    }
  } catch (error) {
    processError(error);
  }
}

/**
 *  Updates the Subject select box based on the date and period selected 
 * */
function updateSubjectList() {
  // clears previous options
   document.querySelector("#subject-int-select").replaceChildren();

  // only proceeds if the select box is still here
  if (INTERVENTION_TEACHERS === null) {
    return;
  }
  
  // gets the date and period selected, returning if blank
  const dateStr = valueOf("#date");
  if (dateStr.length === 0) {
    return;
  }
  const date = new Date(dateStr);
  
  const period = valueOf("#period");
  if (period === null) {
    return;
  }

  if (period === "Wed. PM") {
    showIntTeacherAltInput(true);
    return;
  }
  showIntTeacherAltInput(false);

  const today = new Date();
  const s2Date = new Date(INTERVENTION_TEACHERS.s2Date);

  let schedules;
  if (today.getTime() < s2Date.getTime()) {
    schedules = INTERVENTION_TEACHERS.s1;
  } else {
    schedules = INTERVENTION_TEACHERS.s2;
  }
  
  // cycles through the schedules...
  DAILY_SCHEDULES.forEach(sched => {
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
        appendOption("#subject-int-select", teacher, teacher);
      })
    }
  })
}

/**
 * Updates the Study Teacher select box based on the date and period selected 
 * */
function updateStudyList() {
   // clears previous options
  document.querySelector("#study-teacher-select").replaceChildren();

  // only proceeds if the select box is still here
  if (STUDY_TEACHERS === null) {
    return;
  }
  
  // gets the date and period selected, returning if blank
  const dateStr = valueOf("#date");
  if (dateStr.length === 0) {
    return;
  }
  const date = new Date(dateStr);

  const period = valueOf("#period");
  if (period === null) {
    return;
  }

  setVisible("#study-div", true);
  if (period === "Wed. PM") {
    setVisible("#study-div", false);
  }  

  const today = new Date();
  const s2Date = new Date(STUDY_TEACHERS.s2Date);

  let schedules;
  if (today.getTime() < s2Date.getTime()) {
    schedules = STUDY_TEACHERS.s1;
  } else {
    schedules = STUDY_TEACHERS.s2;
  }

  const altSetting = valueOf("input[name='signup-type']:checked") === "Alt setting";
  if (altSetting) {
    appendOption("#study-teacher-select", "Directly from class", "Directly from class");
    setAttribute("#study-teacher-select #from-class", "selected", true);
  }

  // cycles through the schedules...
  DAILY_SCHEDULES.forEach(sched => {
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
        appendOption("#study-teacher-select", teacher, teacher, false);
      })
    }
  })
}

/**
 *  Updates the Type options is there is a special schedule that period 
 * */
function updateTypeOptions() {
  resetAllTypes();

  toggleTutoringActive();
  preventSignupForNoFly();
  setSpecialScheduleAdjustments();
}

function resetAllTypes() {
  setDisabled(`input[name='signup-type'], input[name='purpose']`, false);
  setVisible('span.type-warning', false);

}

function toggleTutoringActive() {
  const tutoringActive = valueOf('#tutoring-active') === "On";
  if (!tutoringActive) {
    markTutoringDisabled();
  }
}

function setSpecialScheduleAdjustments() {
  // returns if date or period are blank
  const dateStr = valueOf("#date");
  if (dateStr.length === 0) {
    return;
  }
  const date = new Date(dateStr);

  let period = valueOf("#period");
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
  const match = DAILY_SCHEDULES.filter(sched => (isSameDate(new Date(sched.date), date) && (sched.specials !== null)));
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

  checkMax(special.max);
}

function preventSignupForNoFly() {
  const email = valueOf("input#email");
  if (Array.isArray(NO_FLY) && (NO_FLY.includes(email))) {
    setDisabled("input#non-intervention", true);
    setChecked("input#non-intervention", false);
    setVisible("label[for='non-intervention'] span.type-warning", true);
    setText("label[for='non-intervention'] span.type-warning", "Not permitted");
  }
}

function showInterventions() {
  setDisabled("input#intervention", true);
  setChecked("input#intervention", false);
  setVisible("label[for='intervention'] span.type-warning", true);
  setText("label[for='intervention'] span.type-warning", "Not available");
}

function showAssessmentMakeups() {
  setDisabled("input#assessment", true);
  setChecked("input#assessment", false);
  setVisible("label[for='assessment'] span.type-warning", true);
  setText("label[for='assessment'] span.type-warning", "Not available");
}

function showAltSetting() {
  setDisabled("input#alt-setting", true);
  setChecked("input#alt-setting", false);
  setVisible("label[for='alt-setting'] span.type-warning", true);
  setText("label[for='alt-setting'] span.type-warning", "Not available");
}

function showTutoring() {
  setDisabled("input#tutoring", true);
  setChecked("input#tutoring", false);
  setVisible("label[for='tutoring'] span.type-warning", true);
  setText("label[for='tutoring'] span.type-warning", "Not available");
}

function showWednesdayInterventions() {
  setDisabled("input#non-intervention", true);
  setChecked("input#non-intervention", false);
  setVisible("label[for='non-intervention'] span.type-warning", true);
  setText("label[for='non-intervention'] span.type-warning", "Not available");
}

function showNonInterventions() {
  setDisabled("input#non-intervention", true);
  setChecked("input#non-intervention", false);
  setDisabled("input[name='purpose']", true);
  setChecked("input[name='purpose']", false);
  setVisible("label[for='purpose'] span.type-warning", true);
  setText("label[for='purpose'] span.type-warning", "Not available");
}

// gets the max number of signsups for the date/period and checks if full
function checkMax(specialMax) {
  // gets the max number of signsups for the date/period and checks if full
  setCurrentMax(specialMax);
  if (Number.isNaN(CURRENT_MAX) && (CURRENT_MAX !== "")) {
    setCurrentMax(parseInt(CURRENT_MAX));
  } else {
    setCurrentMax(DEFAULT_MAX);
  }
  checkFull();
}

function markTutoringDisabled() {
  setDisabled("input#tutoring", true);
  setChecked("input#tutoring", false);
  showTutoring();
}

/**
 *  Checks fields to make sure not required data is missing 
 * */
function validateForm() {
  setInvalid("input, select, textarea, div", false);
  const invalidFields = getInvalidFields(); 
  // console.log(invalidFields);
  if (invalidFields.length > 0) {
    setInvalid(invalidFields, true);
    return false;
  }
  return true;
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
  const wedIntActive = valueOf("#wed-int-active") === "true";

  // console.log("Wed Int - returning "+ (dateIsWednesday && wedIntActive));
  return dateIsWednesday && wedIntActive;
}

/**
 *  Checks to see if the URL sent a row id. If so, this form is to update existing data 
 * rather than submit new data 
 * */
function setUpdateStatus() {
  // requires that user is an editor and that and update row was provided
  setIsEditor(valueOf("#is-editor") === "true");
  setUpdateRowId(valueOf("#update-row-id"));
  
  // allow editors to edit the email field
  setDisabled("#email", !IS_EDITOR);

  // hide any elements that aren't for editors
  setVisible(".editors-only", IS_EDITOR);

  if (!IS_EDITOR || (UPDATE_ROW_ID === "")) {
    return;
  }
  
  // swap the submit button for an update button
  setVisible("#btn-submit", false);
  setVisible("#btn-update", true);
    
  // requests the signup data for this row id
  google.script.run
    .withSuccessHandler(receiveUpdateStudent)
    .withFailureHandler(processError)
    .getSignupByRow(UPDATE_ROW_ID);
}

/**
 *  Receives signup data from the server (if updating instead of creating new) 
 * */
function receiveUpdateStudent(signupJson) {
  if (signupJson === null) {
    processError(new Error("Invalid URL parameters"));
    return;
  }
  const signup = JSON.parse(signupJson);
  // console.log("SIGNUP", signup);
  UPDATE_DATA = signup;
}

/**
 *  Responds generically to a server error 
 * */
function processError(error) {
  hideLoadingModal();
  showErrorToast(error.message);
  console.error(error);
}

/**
 *  Shows an error (red) toast 
 * */
function showErrorToast(errorMessage) {
  setText("#error-toast .toast-body", errorMessage);
  showBootstrapToast("#error-toast");
}

/**
 *  Shows the loading modal, which waits until cleared 
 * */
function showLoadingModal(text) {
  setText("#loading-modal .loading-text", text);
  showBootstrapModal("#loading-modal");
}

/**
 *  Shows a successful (green) submission toast 
 * */
function showSuccessToast(text) {
  showBootstrapToast("#success-toast", text)
}
