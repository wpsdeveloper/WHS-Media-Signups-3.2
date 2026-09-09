import * as dom from "./dom";
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
export const preventFormSubmit = () => {
  var forms = document.querySelectorAll('form');
  for (var i = 0; i < forms.length; i++) {
    forms[i].dom.addEventListener('submit', function(event) {
      event.preventDefault();
    });
  }
};

/**
 *  Responds to a successful submission notice from the server 
 * */
function submitComplete(success) {
  messaging.showSuccessToast("Submission complete");
  messaging.hideLoadingModal();

  // shows success panel, hides input fields
  dom.setVisible("#form", false);
  dom.setVisible("#success-box", true);
}

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


  const url = window.location.href;
  const debug = (url.indexOf('localhost') >= 0 || url.indexOf('127.0.0.1') >= 0);

  if (debug) {
    await mockSubmit();
    submitComplete();
    return;
  }
  if ((UPDATE_ROW_ID === null) || (UPDATE_ROW_ID === "")) {
    // new submission

    google.script.run
      .withSuccessHandler(submitComplete)
      .withFailureHandler(messaging.processError)
      .submitForm(data);
  } else {
    // updating existing records

    data.rowId = UPDATE_ROW_ID;
    google.script.run
      .withSuccessHandler(updateComplete)
      .withFailureHandler(messaging.processError)
      .submitForm(data);
  }
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
  return data;
}


/**
 *  Checks fields to make sure not required data is missing 
 * */
function validateForm(formData) {
  dom.setInvalid("input, select, textarea, div", false);
  const invalidFields = getInvalidFields(formData); 
  // console.log(invalidFields);
  if (invalidFields.length > 0) {
    dom.setInvalid(invalidFields, true);
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
 *  Responds to a successful update notice from the server 
 * */
function updateComplete(success) {
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
  dom.setValue("#student", "");
  // dom.setValue("#purpose", "");
  dom.setValue("#study-teacher-input", "");
  dom.setValue("#acad-teacher", "");
  dom.setValue("#topic-intervention", "");
  dom.setValue("#subject-int-select", "");
  dom.setVisible("#form", true);
  dom.setVisible("#success-box", false);
 }


async function mockSubmit() {
  console.log("Debug mode: Form data to submit:", data);
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  await delay(2000);
  return;
}



