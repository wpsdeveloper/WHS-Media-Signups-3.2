import * as dom from "../common/dom";
import * as messaging from '../common/messaging.js';
import { store } from '../common/store';
import { DEBUG } from "../common/debug.js";

/**
 *  Sends the form data to the server for submission 
 * */
export const submitForm = async () => {
  const formData = collectData();

  // returns if form is not validated (validation indicators occur in validateForm function)
  if (!validateForm(formData)) {
    console.log("Invalid form data, submission aborted.");
    return;
  }

  messaging.showLoadingModal("Submitting");

  const updateRowId = store.getState().updateRowId;

  try {
    if (DEBUG) {
      await mockSubmit(formData);
      submitComplete();
    } else if (!updateRowId) {
      // new submission
      await submitNewFormData(formData);      
      submitComplete();
    } else {
      // updating existing records
      formData.rowId = updateRowId;
      await submitUpdatedFormData(formData);
      updateComplete();
    }
  } catch (error) {
    console.error("Error submiting form to server:", error);
  }
}

async function submitNewFormData(formData) {
  return new Promise((resolve, reject) => {
    google.script.run
      .withSuccessHandler(resolve)
      .withFailureHandler(reject)
      .submitForm(formData);
    });
}

async function submitUpdatedFormData(formData) {
  return new Promise((resolve, reject) => {
    google.script.run
    .withSuccessHandler(resolve)
    .withFailureHandler(reject)
    .submitForm(formData);
  })
};

/**
 * Gathers all entered form data in prep for validation and submission 
 * @return {SignupData}
 * */
function collectData() {
  const state = store.getState();
  const data = {};
  
  data.email = dom.valueOf("#email");
  data.firstname = "";
  data.lastname = "";

  if (dom.isVisible("#student")) {
    const student = dom.valueOf("#student");
    const brackets = student.indexOf(" <") >0 ? student.split(" <") : [];
    const names = (brackets.length > 0) ? brackets[0].split(", ") : [];

    data.firstname = names.length > 0 ? names[1] : "";
    data.lastname = names.length > 0 ? names[0] : "";
    data.emailStudent = (brackets.length == 2) ? brackets[1].trim().substring(0, brackets[1].length-1) : "";
  } else {
    data.emailStudent = data.email;
  }

  data.date = state.currentDate || dom.valueOf("#date");
  data.period = state.currentPeriod || dom.valueOf("#period");
  data.type = state.currentType || dom.valueOf("input[name='signup-type']:checked");
  
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

  return data;
}


/**
 *  Checks fields to make sure not required data is missing 
 * */
function validateForm(formData) {
  dom.setInvalid("input, select, textarea, div", false);
  const invalidFields = getInvalidFields(formData); 

  if (invalidFields.length > 0) {
    const invalidIds = invalidFields.join(", ");
    dom.setInvalid(invalidIds, true);
    return false;
  }
  return true;
}

/**
 *  Logic for each field to determine if valid or not 
 * 
 * @return {string[]} Array of class names to mark aas invalid
 * */
function getInvalidFields(data) {
  const invalidFields = [];

  // requires student names if student is visible (teacher submission)
  if (dom.isVisible("#student")) {
    if (!data.firstname) invalidFields.push("#student");
    if (!data.lastname) invalidFields.push("#student");
  }

  try {
    if (!data.date) {
      invalidFields.push("#date");
    } else {
      new Date(data.date);
    }
  } catch (error) {
    invalidFields.push("#date");
  }
  if (!data.period) invalidFields.push("#period");

  // requires study teacher is selected/input
  if (dom.isVisible("#study-teacher") && !data.teacherStudy) {
    invalidFields.push("#study-teacher");
  }

  // requires type is selected
  if (!data.type) invalidFields.push("#type");

  if (["Non-intervention", "Assessment", "Alt setting"].includes(data.type) && !data.teacherAcad) {
    invalidFields.push("#acad-teacher");
  }

  // sends invalid class names back
  return invalidFields;
}

/**
 *  Responds to a successful submission notice from the server 
 * */
function submitComplete() {
  messaging.showSuccessToast("Submission complete");
  messaging.hideLoadingModal();

  // shows success panel, hides input fields
  dom.setVisible("#form", false);
  dom.setVisible("#success-box", true);
}

/**
 *  Responds to a successful update notice from the server 
 * */
function updateComplete() {
  messaging.showSuccessToast("Update complete.");
  messaging.hideLoadingModal();

  // shows success panel, hides input fields
  dom.setVisible("#form", false);
  dom.setVisible("#success-update-box", true);
}

/**
 * Resets the page for another submission 
 * */
 export const startOver = () => {
  store.setState({
    currentType: null,
    currentStudyTeacher: null,
    currentSubject: null,
    currentStudentName: '',
  });
  
  dom.setValue("#student", "");
  // dom.setValue("#purpose", "");
  dom.setValue("#study-teacher-input", "");
  dom.setValue("#acad-teacher", "");
  dom.setValue("#topic-intervention", "");
  dom.setValue("#subject-int-select", "");
  dom.setVisible("#form", true);
  dom.setVisible("#success-box", false);
 }


async function mockSubmit(data) {
  console.log("Debug mode: Form data to submit:", data);
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  await delay(2000);
  return;
}



