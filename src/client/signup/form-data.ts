import * as dom from "../common/dom";
import * as messaging from '../common/messaging';
import { store } from './signup-store';
import { IS_DEBUG } from "../common/debug";

/**
 *  Sends the form data to the server for submission.
 *  It handles both new submissions and updates to existing records.
 *  Displays loading and completion modals during the process.
 * 
 *  @returns {Promise<void>} Resolves when the submission is complete.
 * */
export const submitForm = async (): Promise<void> => {
  const unvalidatedFormData = collectData();
  const formData = validateForm(unvalidatedFormData);
  
  // returns if form is not validated (validation indicators occur in validateForm function)
  if (!formData) {
    console.error("Invalid form data, submission aborted.");
    return;
  }
  
  messaging.showLoadingModal("Submitting");
  const updateRowId = store.getState().updateRowId;
  debugger;

  try {
    if (IS_DEBUG) {
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

/**
 * Submits new signup data to the server-side Google Apps Script function.
 * 
 * @param {Signup} formData - The validated signup data to submit.
 * @returns {Promise<unknown>} A promise that resolves when the server successfully processes the form.
 */
async function submitNewFormData(formData: Signup) {
  return new Promise((resolve, reject) => {
    google.script.run
      .withSuccessHandler(resolve)
      .withFailureHandler(reject)
      .submitForm(JSON.stringify(formData));;
    });
}

/**
 * Submits updated signup data to the server-side Google Apps Script function.
 * 
 * @param {Signup} formData - The validated signup data including the rowId to update.
 * @returns {Promise<unknown>} A promise that resolves when the server successfully updates the record.
 */
async function submitUpdatedFormData(formData: Signup) {
  return new Promise((resolve, reject) => {
    google.script.run
    .withSuccessHandler(resolve)
    .withFailureHandler(reject)
    .submitForm(JSON.stringify(formData));
  })
};

/**
 * Gathers all entered form data from the DOM and current store state 
 * in preparation for validation and submission.
 * 
 * @returns {Partial<Signup>} The raw, unvalidated form data collected from the UI.
 * */
function collectData(): Partial<Signup> {
  const state = store.getState();
  const data: Partial<Signup> = {};
  
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
  if (state.ui_currentDate) data.date = state.ui_currentDate;
  data.period = state.ui_currentPeriod || dom.valueOf("#period");
  if (state.ui_currentType) data.type = state.ui_currentType;
  
  // gets subject from whichever is visible
  if (dom.isVisible(".subject-int")) {
    data.subject = dom.valueOf(".subject-int");
  } else if (dom.isVisible("#subject-non-int")) {
    data.subject = dom.valueOf("#subject-non-int");
  }

  data.purpose = dom.isVisible("#purpose") ? dom.valueOf("#purpose select") : "";
  data.room = dom.isVisible("#glass-room") ? dom.valueOf("#glass-room input[type='radio']:checked") as Signup['room'] : null;
  data.teacherStudy = dom.valueOf(".study-teacher");
  data.teacherAcad = dom.valueOf("#acad-teacher");
  data.comments = dom.valueOf("#topic-intervention");

  const rowId = store.getState().updateRowId;
  if (rowId) data.rowId = rowId;

  return data;
}


/**
 *  Checks fields to make sure no required data is missing.
 *  Updates the DOM to visually indicate invalid fields.
 * 
 *  @param {Partial<Signup>} formData - The unvalidated form data.
 *  @returns {Signup | false} The validated form data object, or false if validation failed.
 * */
function validateForm(formData: Partial<Signup>): Signup | false {
  dom.setInvalid("input, select, textarea, div", false);
  const invalidFields = getInvalidFields(formData); 

  if (invalidFields.length > 0) {
    const invalidIds = invalidFields.join(", ");
    dom.setInvalid(invalidIds, true);
    return false;
  }
  return {...formData} as Signup;
}

/**
 *  Logic for each field to determine if valid or not based on the selected signup type and visibility.
 * 
 *  @param {Partial<Signup>} data - The unvalidated form data.
 *  @returns {string[]} Array of CSS selectors (IDs/classes) to mark as invalid.
 * */
function getInvalidFields(data: Partial<Signup>): string[] {
  const invalidFields = [];

  // requires student names if student is visible (teacher submission)
  if (dom.isVisible("#student")) {
    if (!data.firstname) invalidFields.push("#student");
    if (!data.lastname) invalidFields.push("#student");

    const students = (store.getState().students as Student[]) || [];
    const email = data.emailStudent || "";
    const studentObj = students.find(s => 
      s.email.toLowerCase() === email.toLowerCase() || 
      (s.lastname.toLowerCase() === (data.lastname || '').toLowerCase() && s.firstname.toLowerCase() === (data.firstname || '').toLowerCase())
    );
    if (studentObj?.noFly) {
      if (!store.getState().ui_noFlyOverridden) {
        invalidFields.push("#student");
      }
    }
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
  if (!data.type) {
    invalidFields.push("#type");
  } else if (["Non-intervention", "Assessment", "Alt setting"].includes(data.type) && !data.teacherAcad) {
    invalidFields.push("#acad-teacher");
  }

  // sends invalid class names back
  return invalidFields;
}

/**
 *  Responds to a successful submission notice from the server.
 *  Hides the loading modal and shows the success panel.
 * 
 *  @returns {void}
 * */
function submitComplete(): void {
  messaging.showSuccessToast("Submission complete");
  messaging.hideLoadingModal();

  // shows success panel, hides input fields
  dom.setVisible("#form", false);
  dom.setVisible("#success-box", true);
}

/**
 *  Responds to a successful update notice from the server.
 *  Hides the loading modal and shows the update success panel.
 * 
 *  @returns {void}
 * */
function updateComplete(): void {
  messaging.showSuccessToast("Update complete.");
  messaging.hideLoadingModal();

  // shows success panel, hides input fields
  dom.setVisible("#form", false);
  dom.setVisible("#success-update-box", true);
}

/**
 * Resets the page state and UI for another new submission.
 * Clears form fields and shows the main form.
 * 
 * @returns {void}
 * */
 export const startOver = (): void => {
  store.setState({
    ui_currentType: null,
    ui_currentStudyTeacher: null,
    ui_currentSubject: "",
    ui_currentStudentName: '',
  });
  
  dom.setValue("#student", "");
  const errorDiv = dom.qs('#student-nofly-error');
  if (errorDiv) errorDiv.classList.add('d-none');
  const input = dom.qs('#student');
  if (input) input.classList.remove('is-invalid');
  // dom.setValue("#purpose", "");
  dom.setValue("#study-teacher-input", "");
  dom.setValue("#acad-teacher", "");
  dom.setValue("#topic-intervention", "");
  dom.setValue("#subject-int-select", "");
  dom.setVisible("#form", true);
  dom.setVisible("#success-box", false);
 }


/**
 * Simulates form submission for debugging and local testing without a server.
 * 
 * @param {Signup} data - The validated form data to mock submit.
 * @returns {Promise<void>} Resolves after a short simulated delay.
 */
async function mockSubmit(data: Signup): Promise<void> {
  console.warn("Debug mode: Form data to submit:", data);
  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
  await delay(2000);
  return;
}



