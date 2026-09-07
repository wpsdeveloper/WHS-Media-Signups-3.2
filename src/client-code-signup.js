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
  state
} from "./signup/state.js";

import {
  getInitialData,
} from "./signup/init.js";

import * as scheduling from './signup/scheduling.js'
import * as dom from "./signup/dom.js";
import * as ui from "./signup/ui.js";
import * as parser from "./signup/parsers.js";
import * as dates from "./signup/dates.js";


/* Initialization, after everything has loaded */
document.addEventListener("DOMContentLoaded", () => {
  initializeUi();
  bindEvents();
  showLoadingModal("Retrieving data");
  ui.updateDetailsPanel();

  // preps for whether this page is a new submission or an update to existing data
  setUpdateStatus(state);
  
  ui.checkStaffStatus(state);
  ui.checkAdminStatus(state);

  // gathers all data needed to populate the form
  getInitialData(processInitialData, processError);
});

function bindEvents() {
  dom.addEventListener('input[name="signup-type"]', "change", typeChanged);
  dom.addEventListener('#date', "change", dateChanged);
  dom.addEventListener('#period', "change", periodChanged);
  dom.addEventListener('#btn-submit', "click", submitForm);
  dom.addEventListener('#btn-update', "click", submitForm);
  dom.addEventListener('.success-box-start-over', "click", startOver); 
}

function processInitialData(data) {
  parseInitialData(data);
  initUi();
}

function parseInitialData(data) {
  // console.log(data);
  state.students = parser.parseStudents(data.students);
  state.studentNames = parser.parseStudentNames(state.students);
  state.dailySchedules = parser.parseDailySchedules(data.dailySchedules);
  state.signups = parser.parseSignups(data.signups);
  state.interventionTeachers = parser.parseInterventionTeachers(data.interventionTeachers);
  state.studyTeachers = parser.parseStudyTeachers(data.studyTeachers);
  state.noFlyList = parser.parseNoFlyList(data.noFlyList);
  state.defaultMax = parser.parseMaxSignups(data.defaultMaxSignups);
  state.currentMax = state.defaultMax;

  hideLoadingModal();
  typeChanged();
  if (state.updateData !== null) {
    populateData(state.updateData);
  }
}

function initUi() {
  ui.checkStaffStatus(state);
  ui.checkAdminStatus(state);
  typeChanged();
  dateChanged();
}


/**
 * Gathers all entered form data in prep for validation and submission 
 * @return {SignupData}
 * */
function collectData() {
  const data = {};
  
  data.email = dom.valueOf("#email");
  
  // sets at least blanks for the names
  data.firstname = "";
  data.lastname = "";

  if (dom.isVisible("#student")) {
    // this is a teacher submission
    // breaks apart the line selected in the typeahead
    const student = dom.valueOf("#student");
    const brackets = student.indexOf(" <") >0 ? student.split(" <") : [];
    const names = (brackets.length > 0) ? brackets[0].split(", ") : [];

    data.firstname = names.length > 0 ? names[1] : "";
    data.lastname = names.length > 0 ? names[0] : "";
    data.emailStudent = (brackets.length == 2) ? brackets[1].trim().substring(0, brackets[1].length-1) : "";
  } else {
    // this is a student submission
    data.emailStudent = data.email;
  }
  data.date = dom.valueOf("#date");
  data.period = dom.valueOf("#period");
  data.type = dom.valueOf("input[name='signup-type']:checked");
  
  // gets subject from whichever is visible
  if (dom.isVisible(".subject-int")) {
    data.subject = dom.valueOf(".subject-int");
  } else if (dom.isVisible("#subject-non-int")) {
    data.subject = dom.valueOf("#subject-non-int");
  }

  data.purpose = dom.isVisible("#purpose") ? dom.valueOf("#purpose input[type='radio']:checked") : "";
  data.room = dom.isVisible("#glass-room") ? dom.valueOf("#glass-room input[type='radio']:checked") : "";
  data.teacherStudy = dom.valueOf(".study-teacher");
  data.teacherAcad = dom.valueOf("#acad-teacher");
  data.comments = dom.valueOf("#topic-intervention");

  console.log(data);
  return data;
}

/**
 *  Responds to a change in the Date field 
 * */
function dateChanged() {
  ui.updatePeriodList(state.dailySchedules);
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
  if (dom.isVisible("#student")) {
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
  if (dom.isVisible("#study-teacher") && (data.teacherStudy.length <= 0)) {
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
  dom.hideBootstrapModal("#loading-modal");
}



/**
 * Sets up some UI elements, such as the date picker and tooltips
 */
function initializeUi() {
  const today = new Date();
  dom.configureDateInput("#date",
    dates.toDateInputValue(new Date(today.getTime() - 14 * 86400000)),
    dates.toDateInputValue(new Date(today.getTime() + 14 * 86400000)),
    dates.toDateInputValue(today)
  );
  
  dom.setTooltips('[data-bs-toggle="tooltip"]');

  dom.setVisible(".int-link", (dom.getAttribute(".int-link", "href") || "").length > 58);
  dom.setVisible(".tut-link", (dom.getAttribute("href") || "").length > 58);
}



/**
 *  Responds to a change in the Period field 
 * */
function periodChanged() {
  ui.updateTypeOptions(state);
  ui.updateSubjectList(state.interventionTeachers, state.dailySchedules);
  ui.updateStudyList(state.studyTeachers, state.dailySchedules);
  ui.updateGlassRooms(state.signups);
  scheduling.checkFull(state.signups, state.currentMax);
}

/**
 * Populates data into the form (useful for editing existing data)
 * 
 * @param {SignupData} signup A record of signup date to enter into fields
 */
function populateData(signup) {
  dom.setValue("#student", `${signup.lastname}, ${signup.firstname} <${signup.emailStudent}`);
  dom.setValue("#date", formatDateSlashes(new Date(signup.date)));
  dateChanged();
  
  dom.setValue("#period", "" + signup.period);
  periodChanged();
  
  dom.setValue("#subject").val(signup.subject);
  dom.setValue("#study-teacher", signup.teacherStudy);
  dom.setValue("#acad-teacher", signup.teacherAcad);

  // unchecks Types, and check the correct one
  dom.setValue("#type input").prop("checked", "false");
  dom.setValue(`#type input[value="${signup.type}"]`).prop("checked", "true");
  typeChanged();

  // unchecks all Purposes and then checks the correct one 
  dom.setChecked("#purpose input", false);
  dom.setChecked(`#purpose input[value="${signup.purpose}"]`, true);

  // unchecks all Glass Rooms and then checks the correct one 
  dom.setChecked("#glass-room input", false);
  dom.setChecked(`#glass-room input[value="${signup.room}"]`, true);

  // fills the topic/comments
  dom.setValue("#topic-intervention", signup.comments);
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
    forms[i].dom.addEventListener('submit', function(event) {
      event.preventDefault();
    });
  }
};





/**
 * Resets the page for another submission 
 * */
 function startOver() {
  dom.setValue("#student", "");
  dom.setValue("#purpose", "");
  dom.setValue("#study-teacher-input", "");
  dom.setValue("#acad-teacher", "");
  dom.setValue("#topic-intervention", "");
  dom.setValue("#subject-int-select", "");
  dom.setVisible("#form", true);
  dom.setVisible("#success-box", false);
 }

/**
 *  Responds to a successful submission notice from the server 
 * */
function submitComplete(success) {
  showSuccessToast("Submission complete");
  hideLoadingModal();

  // shows success panel, hides input fields
  dom.setVisible("#form", false);
  dom.setVisible("#success-box", true);
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
  ui.updateTypeOptions(state);
  scheduling.checkFull(state.signups, state.currentMax);
  ui.updateDetailsPanel(state.dailySchedules);
  ui.updateStudyList(state.studyTeachers, state.dailySchedules);
  ui.updateSubjectList(state.interventionTeachers, state.dailySchedules);
}

/**
 *  Responds to a successful update notice from the server 
 * */
function updateComplete(success) {
  showSuccessToast("Update complete.");
  hideLoadingModal();

  // shows success panel, hides input fields
  dom.setVisible("#form", false);
  dom.setVisible("#success-update-box", true);
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
 *  Checks to see if the URL sent a row id. If so, this form is to update existing data 
 * rather than submit new data 
 * */
function setUpdateStatus() {
  // requires that user is an editor and that and update row was provided
  state.isEditor = dom.valueOf("#is-editor") === "true";
  state.updateRowId = dom.valueOf("#update-row-id");
  
  // allow editors to edit the email field
  dom.setDisabled("#email", !state.isEditor);

  // hide any elements that aren't for editors
  dom.setVisible(".editors-only", state.isEditor);

  if (!state.isEditor || (state.updateRowId === "")) {
    return;
  }
  
  // swap the submit button for an update button
  dom.setVisible("#btn-submit", false);
  dom.setVisible("#btn-update", true);
    
  // requests the signup data for this row id
  google.script.run
    .withSuccessHandler(processUpdateData)
    .withFailureHandler(processError)
    .getSignupByRow(state.updateRowId);
}

function processUpdateData(data) {
  state.updateData = parseUpdateStudent(data);
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
  dom.setText("#error-toast .toast-body", errorMessage);
  dom.showBootstrapToast("#error-toast");
}

/**
 *  Shows the loading modal, which waits until cleared 
 * */
function showLoadingModal(text) {
  dom.setText("#loading-modal .loading-text", text);
  dom.showBootstrapModal("#loading-modal");
}

/**
 *  Shows a successful (green) submission toast 
 * */
function showSuccessToast(text) {
  dom.showBootstrapToast("#success-toast", text)
}
